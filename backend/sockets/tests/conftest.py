import pytest
from django.db import connections

@pytest.fixture(autouse=True)
def close_old_connections(request):
    yield
    if request.node.get_closest_marker('asyncio'):
        for conn in connections.all():
            conn.close()