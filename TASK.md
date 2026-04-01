El problema ocurre porque cuando un pago es rechazado (por ejemplo, por un número de Nequi inválido), el sistema actualiza el estado del **Pago** a "fallido", pero deja la **Reserva** en estado "pendiente". Dado que la lógica de disponibilidad considera que cualquier reserva que no esté "cancelada" ocupa el espacio, la cancha sigue apareciendo como ocupada.

Para solucionar esto, implementaré los siguientes cambios:

### Overview
Ajustaremos el procesamiento de las notificaciones de Wompi (Webhook) para que, si un pago es rechazado o falla, la reserva asociada se cancele automáticamente, liberando así el horario para otros usuarios. También me aseguraré de mapear todos los posibles estados de error de Wompi.

### Key Changes
- `backend/payments/views.py`: Actualizar `WompiWebhookView` para que cambie el estado de la reserva a `cancelled` si el pago es `failed` o `error`.
- `backend/payments/services/wompi_service.py`: Asegurar que el mapeo de estados de Wompi incluya `ERROR`.

### Implementation Steps
1. **Modificar `WompiWebhookView`**: Añadir lógica para que si `payment_status` es `failed`, se actualice `payment.booking.status = "cancelled"`.
2. **Mejorar el mapeo de estados**: Incluir el estado `ERROR` de Wompi para que también resulte en un pago fallido y liberación de la reserva.
3. **Notificación de liberación**: Al cancelar la reserva desde el webhook, disparar la notificación de WebSocket para que el frontend se actualice en tiempo real y la celda vuelva a aparecer disponible.

### Technical Considerations
- **Consistencia**: Al cancelar la reserva, otros usuarios podrán ver el espacio disponible inmediatamente gracias a los WebSockets.
- **Reservas abandonadas**: Si un usuario cierra la pestaña sin pagar, la reserva quedará en `pending`. Por ahora nos enfocamos en el error explícito que reportaste, pero a futuro sería ideal un proceso de limpieza de reservas pendientes antiguas.

### Success Criteria
- Si un pago de Nequi falla (por número inválido), la reserva debe pasar a estado "Cancelada".
- Al revisar el calendario, el horario de la reserva fallida debe aparecer nuevamente como disponible.

