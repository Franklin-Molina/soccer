from rest_framework import status, views, generics # Mantener generics para vistas no refactorizadas
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser # Asumir permisos
from asgiref.sync import async_to_sync

from .models import Plan
from .serializers import PlanSerializer

# Importar casos de uso y repositorio
from .infrastructure.repositories.django_plan_repository import DjangoPlanRepository
from .application.use_cases.get_plan_list import GetPlanListUseCase
from .application.use_cases.get_plan_details import GetPlanDetailsUseCase
# Casos de uso para Create/Update/Delete se pueden añadir si es necesario

class PlanList(views.APIView): # Cambiar a APIView para el método GET
    permission_classes = [IsAuthenticated] # Ajustar permisos según sea necesario

    def get(self, request, *args, **kwargs):
        plan_repository = DjangoPlanRepository()
        get_plan_list_use_case = GetPlanListUseCase(plan_repository)
        
        filters = request.query_params.dict()

        plans = async_to_sync(get_plan_list_use_case.execute)(filters=filters)
        serializer = PlanSerializer(plans, many=True, context={'request': request})
        return Response(serializer.data)

    # POST (create) se puede mantener con generics.CreateAPIView si no hay lógica de negocio compleja
    # o refactorizar con un CreatePlanUseCase.
    # Por ahora, se puede crear una vista separada para POST o añadir el método aquí.
    # Para simplificar, se puede dejar la creación a una vista de admin o un ModelViewSet.


class PlanDetail(views.APIView): # Cambiar a APIView para el método GET
    permission_classes = [IsAuthenticated] # Ajustar permisos

    def get(self, request, pk, *args, **kwargs):
        plan_repository = DjangoPlanRepository()
        get_plan_details_use_case = GetPlanDetailsUseCase(plan_repository)
        
        plan = async_to_sync(get_plan_details_use_case.execute)(plan_id=pk)
        
        if plan:
            serializer = PlanSerializer(plan, context={'request': request})
            return Response(serializer.data)
        return Response(status=status.HTTP_404_NOT_FOUND)

    # PUT, PATCH, DELETE se pueden mantener con generics.RetrieveUpdateDestroyAPIView
    # o refactorizar con casos de uso si es necesario.
    # Por ahora, se pueden crear vistas separadas o añadir los métodos aquí.
    # Para simplificar, se puede dejar la modificación/eliminación a una vista de admin o un ModelViewSet.

# Si se necesita mantener la funcionalidad CRUD completa con generics para admin,
# se pueden crear vistas separadas para administradores que usen ModelViewSet,
# mientras que las vistas para usuarios generales usan los casos de uso.
# Ejemplo:
# class AdminPlanViewSet(viewsets.ModelViewSet):
#     queryset = Plan.objects.all()
#     serializer_class = PlanSerializer
#     permission_classes = [IsAdminUser]
