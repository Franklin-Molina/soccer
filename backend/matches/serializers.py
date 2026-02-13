from rest_framework import serializers
from .models import MatchCategory, OpenMatch, MatchParticipant
from users.serializers import UserSerializer # Reutilizamos el serializer de usuario
from courts.models import Court


class MatchCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchCategory
        fields = '__all__'

class MatchParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = MatchParticipant
        fields = ['user', 'joined_at']

class OpenMatchSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    participants = MatchParticipantSerializer(many=True, read_only=True)
    category = serializers.StringRelatedField()
    court = serializers.StringRelatedField()
    
    # Campos para la creación/actualización
    category_id = serializers.IntegerField(write_only=True, required=False)
    court_id = serializers.IntegerField(write_only=True, required=False)

    # Campos para la lectura de IDs, para facilitar la edición en el frontend
    category_id_read = serializers.SerializerMethodField()
    court_id_read = serializers.SerializerMethodField()

    class Meta:
        model = OpenMatch
        fields = [
            'id', 'court', 'creator', 'category', 'start_time', 'end_time', 
            'players_needed', 'status', 'created_at', 'participants',
            'category_id', 'court_id', 'category_id_read', 'court_id_read'
        ]
        read_only_fields = ['id', 'creator', 'status', 'created_at', 'participants']

    def get_category_id_read(self, obj):
        return obj.category.id

    def get_court_id_read(self, obj):
        return obj.court.id

    def create(self, validated_data):
        # El 'creator' se añadirá en la vista a partir del usuario autenticado
        return OpenMatch.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        # Manejar la actualización de relaciones si se proporcionan los IDs
        category_id = validated_data.pop('category_id', None)
        court_id = validated_data.pop('court_id', None)

        if category_id:
            instance.category = MatchCategory.objects.get(id=category_id)
        if court_id:
            instance.court = Court.objects.get(id=court_id)

        # Actualizar los demás campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
