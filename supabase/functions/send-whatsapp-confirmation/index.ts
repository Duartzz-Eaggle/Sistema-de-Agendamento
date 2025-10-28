import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@^2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ConfirmationRequest {
  appointmentId: string;
  customerName: string;
  customerWhatsapp: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceName: string;
  servicePrice: number;
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

    const requestData: ConfirmationRequest = await req.json();

    const { data: template } = await supabase
      .from("whatsapp_templates")
      .select("template_content")
      .eq("template_type", "confirmation")
      .eq("active", true)
      .maybeSingle();

    if (!template) {
      throw new Error("Template de confirmação não encontrado");
    }

    const message = template.template_content
      .replace("{{data}}", requestData.appointmentDate)
      .replace("{{horario}}", requestData.appointmentTime)
      .replace("{{servico}}", requestData.serviceName)
      .replace("{{profissional}}", "Onzy Barber")
      .replace("{{valor}}", requestData.servicePrice.toFixed(2));

    const logEntry = {
      appointment_id: requestData.appointmentId,
      message_type: "confirmation",
      recipient_number: requestData.customerWhatsapp,
      message_content: message,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const { data: settings } = await supabase
      .from("business_settings")
      .select("whatsapp_number")
      .limit(1)
      .maybeSingle();

    const whatsappNumber = settings?.whatsapp_number;

    if (!whatsappNumber || whatsappNumber.trim() === "") {
      await supabase.from("whatsapp_logs").insert({
        ...logEntry,
        status: "failed",
        error_message: "Número do WhatsApp não configurado",
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: "WhatsApp não configurado",
          message,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    try {
      const cleanPhone = requestData.customerWhatsapp.replace(/\D/g, "");
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

      await supabase.from("whatsapp_logs").insert({
        ...logEntry,
        status: "sent",
        sent_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          success: true,
          message,
          whatsappUrl,
          note: "Mensagem preparada. Integração com API WhatsApp pendente.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (sendError) {
      await supabase.from("whatsapp_logs").insert({
        ...logEntry,
        status: "failed",
        error_message: String(sendError),
      });

      throw sendError;
    }
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
