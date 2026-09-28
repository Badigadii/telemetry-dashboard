import glob
import os
import re
from dotenv import load_dotenv
import pandas as pd
import clickhouse_connect

load_dotenv()

DATA_DIR = "data"

client = clickhouse_connect.get_client(
    host="localhost",
    port=8123,
    username="default",
    password=os.getenv("CLICKHOUSE_PASSWORD")
)

files = sorted(glob.glob(os.path.join(DATA_DIR, "yellow_tripdata_*.parquet")))
print(f"Found {len(files)} files")

for path in files:
    m = re.search(r"yellow_tripdata_(\d{4})-(\d{2})\.parquet", path)
    year, month = int(m.group(1)), int(m.group(2))

    print(f"Loading {year}-{month:02d} ...")
    df = pd.read_parquet(path)

    df = df.rename(columns={
        "tpep_pickup_datetime": "ts",
        "tpep_dropoff_datetime": "dropoff_ts",
        "VendorID": "vendor_id",
        "RatecodeID": "rate_code",
        "PULocationID": "pu_location",
        "DOLocationID": "do_location",
    })

    df = df[[
        "ts", "dropoff_ts", "vendor_id", "passenger_count",
        "trip_distance", "rate_code", "pu_location", "do_location",
        "payment_type", "fare_amount", "total_amount", "congestion_surcharge",
    ]]

    df = df.dropna(subset=["ts", "dropoff_ts"])

    for col in ["vendor_id", "passenger_count", "rate_code",
                "pu_location", "do_location", "payment_type"]:
        df[col] = df[col].fillna(0).astype("int64")

    df["congestion_surcharge"] = df["congestion_surcharge"].fillna(0).astype("float64")

    client.command(
        f"DELETE FROM trips WHERE toYear(ts) = {year} AND toMonth(ts) = {month}"
    )
    client.insert_df("trips", df)
    print(f"  inserted {len(df)} rows")

print("Done")