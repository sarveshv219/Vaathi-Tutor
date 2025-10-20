from backend.services.doc_store import DocStore

ds = DocStore()
doc_ids = ds.list_ids()
print(f"Document IDs: {doc_ids}")

if doc_ids:
    doc = ds.get(doc_ids[0])
    pcs = doc.get('page_contexts', [])
    print(f"\nTotal pages: {len(pcs)}")
    
    if pcs:
        print(f"\nFirst page info:")
        print(f"  - Captions: {pcs[0].get('captions', [])}")
        print(f"  - Has raw_text: {bool(pcs[0].get('raw_text'))}")
        print(f"  - Has ocr_text: {bool(pcs[0].get('ocr_text'))}")
        print(f"  - page_context length: {len(pcs[0].get('page_context', ''))}")
        print(f"  - page_id: {pcs[0].get('page_id')}")
        
        # Check if captions are in page_context
        pc = pcs[0].get('page_context', '')
        captions = pcs[0].get('captions', [])
        if captions:
            print(f"\n  Caption in page_context: {'Yes' if captions[0] in pc else 'No'}")
    
    # Check vector index page_ids
    index = doc.get('index')
    if index:
        print(f"\nVector index exists: True")
        # Try to query it
        from backend.services.ai_adapter import query_index
        results = query_index(index, "figure", k=3)
        print(f"Sample query results (k=3):")
        for r in results:
            print(f"  - page_id: {r.get('page_id')}, text length: {len(r.get('text', ''))}")
