import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@^2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const todayDate = now.toISOString().split("T")[0];
    const minTime = oneHourLater.toTimeString().slice(0, 8);
    const maxTime = twoHoursLater.toTimeString().slice(0, 8);

    const { data: appointments, error: fetchError } = await supabase
      .from("appointments")
      .select(`
        id,
        customer_name,
        customer_whatsapp,
        appointment_date,
        appointment_time,
        reminder_sent,
        service:services(name, price)
      `)
      .eq("appointment_date", todayDate)
      .eq("reminder_sent", false)
      .neq("status", "cancelled")
      .gte("appointment_time", minTime)
      .lte("appointment_time", maxTime);

    if (fetchError) throw fetchError;

    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Nenhum lembrete para enviar no momento",
          count: 0,
          checkedAt: now.toISOString(),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: template } = await supabase
      .from("whatsapp_templates")
      .select("template_content")
      .eq("template_type", "reminder")
      .eq("active", true)
      .maybeSingle();

    if (!template) {
      throw new Error("Template de lembrete não encontrado");
    }

    const results = [];

    for (const appointment of appointments) {
      try {
        const message = template.template_content
          .replace("{{nome_cliente}}", appointment.customer_name)
          .replace("{{horario}}", appointment.appointment_time.slice(0, 5));

        const cleanPhone = appointment.customer_whatsapp.replace(/\D/g, "");
        const encodedMessage = encodeURIComponent(message);

        const logEntry = {
          appointment_id: appointment.id,
          message_type: "reminder",
          recipient_number: appointment.customer_whatsapp,
          message_content: message,
          status: "sent",
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };

        await supabase.from("whatsapp_logs").insert(logEntry);

        await supabase
          .from("appointments")
          .update({
            reminder_sent: true,
            reminder_sent_at: new Date().toISOString(),
          })
          .eq("id", appointment.id);

        results.push({
          appointmentId: appointment.id,
          customer: appointment.customer_name,
          time: appointment.appointment_time.slice(0, 5),
          success: true,
          whatsappUrl: `https://wa.me/${cleanPhone}?text=${encodedMessage}`,
        });
      } catch (error) {
        results.push({
          appointmentId: appointment.id,
          customer: appointment.customer_name,
          success: false,
          error: String(error),
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `${successCount} de ${results.length} lembretes processados`,
        count: results.length,
        successCount,
        failureCount: results.length - successCount,
        results,
        checkedAt: now.toISOString(),
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
        checkedAt: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
