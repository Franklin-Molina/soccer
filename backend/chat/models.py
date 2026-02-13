from django.db import models
from django.conf import settings
from matches.models import OpenMatch

class ChatMessage(models.Model):
    """Mensaje de chat para un partido específico"""
    match = models.ForeignKey(OpenMatch, on_delete=models.CASCADE, related_name='chat_messages')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_messages')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.user.username} en Match {self.match.id}: {self.message[:50]}"
