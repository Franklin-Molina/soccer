from rest_framework import serializers
from .models import Court, CourtImage, Category

class CourtImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourtImage
        fields = ['id', 'image_url']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class CourtSerializer(serializers.ModelSerializer):
    images = CourtImageSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Court
        fields = ['id', 'name', 'description', 'price', 'is_active', 'covered', 'category', 'category_id', 'images']

    def validate(self, data):
        if 'name' in data:
            name = data['name']
            if not name or not name.strip():
                raise serializers.ValidationError({"name": "El nombre de la cancha no puede estar vacío."})
            data['name'] = name.strip()

        if 'description' in data:
            description = data['description']
            if not description or not description.strip():
                raise serializers.ValidationError({"description": "La descripción no puede estar vacía."})
            data['description'] = description.strip()

        if 'price' in data:
            price = data['price']
            if price is None:
                raise serializers.ValidationError({"price": "El precio es obligatorio."})
            if not isinstance(price, (int, float)):
                try:
                    price = float(price)
                except ValueError:
                    raise serializers.ValidationError({"price": "El precio debe ser un número válido."})
            
            if price <= 0:
                raise serializers.ValidationError({"price": "El precio debe ser un número positivo."})
            data['price'] = price

        return data

    def create(self, validated_data):
        return Court.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance