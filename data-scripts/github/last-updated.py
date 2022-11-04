import os
from datetime import datetime

if __name__ == "__main__":
    filename = os.getenv("FILENAME")
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    # WRITE A FILE TO THE CURRENT DIRECTORY with the current time
    with open(f"{filename}.txt", "w") as f:
        f.write(current_time)
