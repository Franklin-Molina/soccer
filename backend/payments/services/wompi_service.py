import requests
import hashlib
import time
import logging
from urllib.parse import urlencode
from django.conf import settings
from decimal import Decimal

logger = logging.getLogger(__name__)


class WompiService:
    """
    Servicio para interactuar con la API de Wompi.
    Documentación: https://docs.wompi.co/docs/api-de-wompi
    """
    
    def __init__(self):
        import os
        # Usar os.environ directamente para evitar problemas de comillas y espacios
        self.api_key = os.environ.get('WOMPI_API_KEY', '').strip() # Private Key
        self.public_key = os.environ.get('WOMPI_PUBLIC_KEY', '').strip() # Public Key para Checkout
        self.integrity_secret = os.environ.get('WOMPI_INTEGRITY_SECRET', '').strip() # Secret para firma
        self.merchant_id = os.environ.get('WOMPI_MERCHANT_ID', '').strip()
        self.webhook_url = os.environ.get('WOMPI_WEBHOOK_URL', '').strip()
        
        base_url_raw = os.environ.get('WOMPI_BASE_URL', 'https://sandbox.wompi.co/v1')
        # Limpiar comillas y espacios si existen
        self.base_url = base_url_raw.strip().strip("'\"")
        self.frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        
        # Log siempre visible para debug
       # logger.warning(f"WOMPI CONFIG - Public Key: {self.public_key[:15]}...")
       # logger.warning(f"WOMPI CONFIG - Base URL: {self.base_url}")
        
    def _get_headers(self):
        """Headers para las peticiones a Wompi."""
        # Log del header completo (ocultando la key)
        auth_header = f'Bearer {self.api_key}'
       # logger.warning(f"WOMPI HEADERS - Authorization: Bearer {self.api_key[:10]}...")
        
        return {
            'Authorization': auth_header,
            'Content-Type': 'application/json',
        }
    
    def _generate_integrity_signature(self, reference, amount_in_cents, currency="COP"):
        """
        Genera la firma de integridad para el Web Checkout.
        SHA256(referencia + monto_en_centavos + moneda + secreto_de_integridad)
        """
        if not self.integrity_secret:
           # logger.warning("WOMPI - No integrity secret configured. Signature will not be generated.")
            return None
            
        raw_string = f"{reference}{amount_in_cents}{currency}{self.integrity_secret}"
        signature = hashlib.sha256(raw_string.encode('utf-8')).hexdigest()
        return signature

    def create_checkout(self, reference, amount_in_cents, customer_email, 
                        customer_name='', redirect_url='', webhook_url='', secure_token=None):
        """
        Genera los datos necesarios para el Web Checkout de Wompi.
        En el flujo de redirección, no llamamos a /transactions desde el backend.
        
        Args:
            reference (str): Referencia única del pago
            amount_in_cents (int): Monto en centavos
            customer_email (str): Email del cliente
            customer_name (str): Nombre del cliente
            redirect_url (str): URL de redirección después del pago
            webhook_url (str): URL para recibir notificaciones
            secure_token (str): Token de seguridad para la redirección
            
        Returns:
            dict: Datos para construir el formulario o redirección
        """
        if not redirect_url:
            # Usar la URL completa del frontend para la redirección de éxito
            # Incluimos la referencia y el token para que el frontend pueda consultar el estado de forma segura
            redirect_url = f"{self.frontend_url}/payment/success?reference={reference}"
            if secure_token:
                redirect_url += f"&token={secure_token}"
            
        # Generar firma de integridad
        signature = self._generate_integrity_signature(reference, amount_in_cents)
        
        # Construir URL de pago por redirección (Web Checkout)
        # Sandbox: https://checkout.wompi.co/p/
        # Producción: https://checkout.wompi.co/p/
        checkout_base_url = "https://checkout.wompi.co/p/"
        
        params = {
            "public-key": self.public_key,
            "currency": "COP",
            "amount-in-cents": amount_in_cents,
            "reference": reference,
            "redirect-url": redirect_url,
        }
        
        # Usar webhook_url pasado o el configurado en el servicio
        final_webhook_url = webhook_url or self.webhook_url
        if final_webhook_url:
            # El webhook de nuestro backend está en /api/payments/wompi/webhook/
            # Si WOMPI_WEBHOOK_URL es solo el dominio, construimos la ruta completa
            if not final_webhook_url.endswith('/api/payments/wompi/webhook/'):
                base = final_webhook_url.rstrip('/')
                final_webhook_url = f"{base}/api/payments/wompi/webhook/"
            
            params["webhook-url"] = final_webhook_url
          #  logger.info(f"Incluyendo webhook-url en el checkout: {final_webhook_url}")
        
        if signature:
            params["signature:integrity"] = signature

        # Construir la URL con parametros para redireccion directa si se desea
        payment_url = f"{checkout_base_url}?{urlencode(params)}"
        
      #  logger.info(f"Generada URL de pago Wompi para referencia: {reference}")
      #  logger.warning(f"URL DE PAGO GENERADA: {payment_url}")
      #  logger.warning(f"PUBLIC KEY USADA: '{self.public_key}'")
        
        return {
            "success": True,
            "payment_url": payment_url,
            "reference": reference,
            "signature": signature,
            "raw_response": params # En este flujo, el "raw_response" son los parámetros enviados
        }
    
    def _build_payment_url(self, presigned_acceptance):
        """
        Construye la URL de pago para redirigir al usuario.
        """
        if not presigned_acceptance:
            return None
        
        acceptance_token = presigned_acceptance.get("acceptance_token")
        if not acceptance_token:
            return None
        
        return f"https://checkout.wompi.co/l/{acceptance_token}"
    
    def validate_webhook_signature(self, body, signature):
        """
        Valida la firma del webhook de Wompi.
        
        Args:
            body (str): Cuerpo de la petición
            signature (str): Firma recibida en el header
            
        Returns:
            bool: True si la firma es válida
        """
        webhook_secret = getattr(settings, 'WOMPI_WEBHOOK_SECRET', '')
        if not webhook_secret:
            return True  # Si no hay secret, no validamos (solo para desarrollo)
        
        expected_signature = hashlib.sha256(
            (body + webhook_secret).encode('utf-8')
        ).hexdigest()
        
        return expected_signature == signature
    
    def process_webhook_event(self, event_data):
        """
        Procesa un evento recibido por webhook.
        
        Args:
            event_data (dict): Datos del evento
            
        Returns:
            dict: Resultado del procesamiento
        """
        event_type = event_data.get("event")
        # En Wompi los datos de la transacción vienen en data.transaction
        transaction = event_data.get("data", {}).get("transaction", {})
        
        if event_type == "transaction.updated":
            status = transaction.get("status")
            reference = transaction.get("reference")
            transaction_id = transaction.get("id")
            
            return {
                "action": "payment_status_update",
                "reference": reference,
                "transaction_id": transaction_id,
                "status": status,
                "payment_method": transaction.get("payment_method", {}).get("type"),
                "amount_in_cents": transaction.get("amount_in_cents"),
            }
        
        return {"action": "unknown", "event_type": event_type}


# Instancia singleton del servicio
wompi_service = WompiService()
