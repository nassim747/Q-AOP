print('Testing import of backend.main')
try:
    import backend.main as m
    print('Imported main ok')
except Exception as e:
    print('Failed', e.__class__.__name__, e) 