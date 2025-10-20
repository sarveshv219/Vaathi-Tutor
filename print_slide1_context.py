from backend.services.doc_store import DocStore

ds = DocStore()
doc_ids = ds.list_ids()
if not doc_ids:
    print('No documents found.')
    exit(0)
doc = ds.get(doc_ids[0])
pcs = doc.get('page_contexts', [])
if not pcs:
    print('No page contexts found.')
    exit(0)
print(f'--- Slide 1 page_context ---\n')
print(pcs[0].get('page_context', '')[:2000])
print('\n--- END ---')