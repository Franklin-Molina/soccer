He analizado a fondo los requisitos para el ciclo completo de torneos. Actualmente tenemos una base funcional, pero para cumplir con un sistema de **eliminación directa** robusto, necesitamos implementar una estructura de **árbol (bracket)** donde los partidos estén conectados entre sí.

Este es el plan detallado para llevar el sistema de torneos al siguiente nivel:

### 1. Evolución del Modelo de Datos
Para soportar llaves eliminatorias, necesitamos que cada partido sepa a qué partido sigue el ganador.
*   **`TournamentMatch`**: Añadiré `next_match` (relación a sí mismo) y `round_number`.
*   **`Tournament`**: Añadiré el estado `closed` para la fase de cierre de inscripciones.

### 2. Generación Inteligente de Fixture (Algoritmo de Potencia de 2)
Implementaré un nuevo algoritmo de generación que:
*   Calcula la potencia de 2 más cercana (ej. si hay 6 o 7 equipos, el bracket se basa en 8).
*   Crea todos los partidos necesarios desde la Final hasta la primera ronda.
*   Gestiona los **BYEs** (equipos que pasan directo): si un equipo no tiene rival en la primera ronda, el sistema lo marcará como ganador automáticamente y lo avanzará a la siguiente fase.
*   Utiliza **Random Shuffle** para garantizar imparcialidad.

### 3. Progresión Automática
Actualizaré la lógica de guardado de resultados para que:
*   Al marcar un partido como `completed`, el sistema identifique al ganador.
*   El ganador sea movido automáticamente al siguiente partido (`next_match`) en la posición correcta (Local o Visitante) según el orden de la llave.
*   Se disparen notificaciones por WebSocket para que todos los clientes vean al equipo avanzar en tiempo real.

### 4. Ciclo de Vida del Torneo
Añadiré acciones para:
*   **Cerrar Inscripciones**: Cambiar de `open` a `closed`, bloqueando nuevos registros.
*   **Finalizar Torneo**: Cambiar a `finished` cuando se complete el último partido.

---

¿Deseas que comience con la implementación de estos cambios en el backend y frontend?