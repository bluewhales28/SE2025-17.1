import pandas as pd

class AnalyticsService:

    def calculate_statistics(self, rows: list[dict]):
        df = pd.DataFrame(rows)

        return {
            "mean": df["score"].mean(),
            "median": df["score"].median(),
            "p90": df["score"].quantile(0.9),
            "distribution": df["score"].value_counts().to_dict()
        }
