import pandas as pd
import numpy as np
import util


def fill_zero():
    table = pd.read_csv("county_hist.csv")
    ncol = table.shape[1]
    data = table.iloc[:,range(8,ncol)]
    data = data.fillna(0)
    data = data.replace(0, np.nan).ffill(axis=1).fillna(0)
    table.iloc[:,range(8,ncol)] = data
    table.to_csv("county_hist.csv", index=False)



def monotonic_check():
    table = pd.read_csv("county_hist.csv")
    col = table.columns[8:]

    # Check whether data is monotonic increasing
    is_increasing = (table[col].T.diff().fillna(0) >= 0).all().tolist()
    indices = [i for i, x in enumerate(is_increasing) if x == False]
    county = table.loc[indices,"county"].tolist()
    state = table.loc[indices,"state"].tolist()
    info = ["{} - {}".format(county[i], state[i]) for i in range(len(indices))]
    for i in info:
        print("Not Monotonic Increasing: {}".format(i))
    info = ["{} \n".format(i) for i in info]
    util.create_not_monotonic()
    util.write_not_monotonic(info)

    print("Sanity Check Completed!")
    pass


# row = table.iloc[indices[5],range(8, table.shape[1])]
# for _, g in row.groupby((row.T.diff() < 0).cumsum()): 
#     print(g)


############ Go! ############

if __name__ == '__main__':
    fill_zero()
    print("### Sanity Check Starts ###")
    monotonic_check()