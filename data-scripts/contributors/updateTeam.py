import pandas as pd
import json
import os

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

def cleanJson(parsed):
    cleanVals = []
    for idx, row in enumerate(parsed):
        cleanVals.append({})
        for property in row:
            if row[property] == 1.0:
                cleanVals[idx][property] = 1
            elif row[property] != None:
                cleanVals[idx][property] = row[property]
    return cleanVals

def main():
    collaborators = pd.read_csv('https://docs.google.com/spreadsheets/d/e/2PACX-1vRHOj1vPf78vMQP4mVKBULABkXzK9c4pSHZazToTfq96GMzQxHqlamtURwmH0Icowig9LjCTi90326c/pub?gid=0&single=true&output=csv')
    coreTeam = pd.read_csv('https://docs.google.com/spreadsheets/d/e/2PACX-1vRHOj1vPf78vMQP4mVKBULABkXzK9c4pSHZazToTfq96GMzQxHqlamtURwmH0Icowig9LjCTi90326c/pub?gid=238845732&single=true&output=csv')

    with open(os.path.join(repo_root, 'src/meta/contributors.js'), 'w') as outfile:
        json.dump(cleanJson(json.loads(collaborators.to_json(orient="records"))), outfile)
    
    with open(os.path.join(repo_root, 'src/meta/contributors.js'), 'r+') as f:
        content = f.read()
        f.seek(0, 0)
        f.write('export const contributors = ' + content)

    with open(os.path.join(repo_root, 'src/meta/coreTeam.js'), 'w') as outfile:
        json.dump(cleanJson(json.loads(coreTeam.to_json(orient="records"))), outfile)

        
    with open(os.path.join(repo_root, 'src/meta/coreTeam.js'), 'r+') as f:
        content = f.read()
        f.seek(0, 0)
        f.write('export const coreTeam = ' + content)

if __name__ == "__main__":
    main()