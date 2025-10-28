import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@^2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CancellationRequest {
  customerWhatsapp: string;
  message: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestData: CancellationRequest = await req.json();
    const cleanPhone = requestData.customerWhatsapp.replace(/\D/g, "");

    const messageText = requestData.message.toLowerCase().trim();
    if (!messageText.includes("cancelar")) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Palavra-chave 'cancelar' não encontrada",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: appointments, error: fetchError } = await supabase
      .from("appointments")
      .select(`
        id,
        customer_name,
        customer_whatsapp,
        appointment_date,
        appointment_time,
        status,
        service:services(name, price)
      `)
      .ilike("customer_whatsapp", `%${cleanPhone}%`)
      .neq("status", "cancelled")
      .gte("appointment_date", new Date().toISOString().split("T")[0])
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (fetchError) throw fetchError;

    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Nenhum agendamento encontrado para este número",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const appointment = appointments[0];

    const appointmentDateTime = new Date(
      `${appointment.appointment_date}T${appointment.appointment_time}`
    );
    const now = new Date();
    const hoursDifference =
      (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    const { data: templates } = await supabase
      .from("whatsapp_templates")
      .select("template_type, template_content")
      .in("template_type", ["cancellation_success", "cancellation_error"])
      .eq("active", true);

    const successTemplate = templates?.find(
      (t) => t.template_type === "cancellation_success"
    );
    const errorTemplate = templates?.find(
      (t) => t.template_type === "cancellation_error"
    );

    if (hoursDifference < 2) {
      const message = errorTemplate?.template_content || "Cancelamento não permitido";

      await supabase.from("whatsapp_logs").insert({
        appointment_id: appointment.id,
        message_type: "cancellation_error",
        recipient_number: requestData.customerWhatsapp,
        message_content: message,
        status: "sent",
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          success: false,
          message,
          reason: "Fora do prazo de cancelamento (2 horas)",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    await supabase
      .from("appointments")
      .update({
        status: "cancelled",
        cancellation_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointment.id);

    const message = successTemplate?.template_content
      .replace("{{horario}}", appointment.appointment_time.slice(0, 5))
      .replace("{{data}}", new Date(appointment.appointment_date).toLocaleDateString("pt-BR")) ||
      "Agendamento cancelado com sucesso";

    await supabase.from("whatsapp_logs").insert({
      appointment_id: appointment.id,
      message_type: "cancellation_success",
      recipient_number: requestData.customerWhatsapp,
      message_content: message,
      status: "sent",
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message,
        appointmentId: appointment.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
