import pandas as pd

def generate_csv(report_type, ref_id, data):
    path = f"/tmp/{report_type}_{ref_id}.csv"

    if not data:
        df = pd.DataFrame([])
    elif isinstance(data, dict):
        df = pd.DataFrame([data])
    else:
        df = pd.DataFrame(data)

    df.to_csv(path, index=False)
    return path
