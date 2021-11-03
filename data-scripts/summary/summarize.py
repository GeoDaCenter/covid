import pandas as pd
import json
import os

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

def getCaseSummary(counties):
    cases = pd.read_csv(os.path.join(repo_root, 'public/csv/covid_confirmed_nyt.csv'))
    summedCases = counties[['GEOID','population']].merge(cases, how="inner", left_on="GEOID", right_on="fips").sum()
    keys = summedCases.keys()[-15:]
    cases14 = []
    casesSummary = {}
    for i in range(len(keys)-1, 0, -1):
        if i == len(keys)-1:
            casesSummary['weeklyAverage'] = round((summedCases[keys[i]]-summedCases[keys[i-7]])/7)
            casesSummary['lastWeeklyAverage'] = round((summedCases[keys[i-7]]-summedCases[keys[i-14]])/7)
            casesSummary['WoW'] = round(((casesSummary['weeklyAverage']-casesSummary['lastWeeklyAverage'])/casesSummary['weeklyAverage'])*1000)/10
            cases14.insert(0,{
                'date': keys[i],
                'dailyNew': int(summedCases[keys[i]]-summedCases[keys[i-1]]),
            })
        else:
            cases14.insert(0,{
                'date': keys[i],
                'dailyNew': int(summedCases[keys[i]]-summedCases[keys[i-1]])
            })

    return {
        "14-day": cases14,
        "summary": casesSummary
    }

def getVaxSummary(hybrid):
    fullyVax = pd.read_csv(os.path.join(repo_root, 'public/csv/vaccination_fully_vaccinated_cdc_h.csv'))
    oneOrMoreDoses = pd.read_csv(os.path.join(repo_root, 'public/csv/vaccination_one_or_more_doses_cdc_h.csv'))
    
    summedFull = hybrid[['GEOID','population']].merge(fullyVax, how="inner", left_on="GEOID", right_on="fips").sum()
    summedOneOrMore = hybrid[['GEOID','population']].merge(oneOrMoreDoses, how="inner", left_on="GEOID", right_on="fips").sum()
    
    keys = summedFull.keys()[-15:]
    vax14 = []
    vaxSummary = {}
    
    for i in range(len(keys)-1, 0, -1):
        if i == len(keys)-1:
            vaxSummary['fullPct'] = round((summedFull[keys[i]]/summedFull['population'])*1000)/10
            vaxSummary['oneOrMorePct'] = round((summedOneOrMore[keys[i]]/summedOneOrMore['population'])*1000)/10
            
            vax14.insert(0,{
                'date': keys[i],
                'dailyFull': summedFull[keys[i]]-summedFull[keys[i-1]],
            })
        else:
            vax14.insert(0,{
                'date': keys[i],
                'dailyFull': summedFull[keys[i]]-summedFull[keys[i-1]],
            })

    return {
        "14-day": vax14,
        "summary": vaxSummary
    }

def getEquitySummary(counties):
    essentialWorkers = pd.read_csv(os.path.join(repo_root, 'public/csv/context_essential_workers_acs.csv'))
    deaths = pd.read_csv(os.path.join(repo_root, 'public/csv/covid_deaths_nyt.csv'))

    mergedDeaths = counties[['GEOID','population']].merge(deaths, how="inner", left_on="GEOID", right_on="fips")
    summedDeaths = mergedDeaths.sum()
    national = round((summedDeaths[summedDeaths.keys()[-1]]/summedDeaths['population'])*10000000)/100

    topQuartileEssential = essentialWorkers[essentialWorkers.pct_essential > essentialWorkers.pct_essential.quantile(.75)]
    summedEssential = mergedDeaths[mergedDeaths.GEOID.isin(list(topQuartileEssential.fips))].sum()[list(mergedDeaths.keys())[-1]]
    summedPopulation = mergedDeaths[mergedDeaths.GEOID.isin(list(topQuartileEssential.fips))].sum()['population']
    nationalEssential = round((summedEssential/summedPopulation)*10000000)/100

    return {
        'nationDeathsPer100k': national,
        'quartileEssentialDeathsPer100k': nationalEssential,
        'quartileEssentialPct': round((nationalEssential-national)/national*100)
    }

def getUsafExtract():
    cases = pd.read_csv(os.path.join(repo_root, 'public/csv/covid_confirmed_nyt.csv'))
    cases = cases[['fips']+list(cases.columns)[-90:]]
    cases.to_csv(os.path.join(repo_root, 'public/csv/covid_confirmed_nyt.csv'), index=False)
if __name__ == "__main__":
    with open(os.path.join(repo_root, 'public/geojson/county_nyt.geojson')) as f:
        data = json.load(f)
    counties = pd.DataFrame([f['properties'] for f in data['features']])

    with open(os.path.join(repo_root, 'public/geojson/cdc_h.geojson')) as f:
        data = json.load(f)
    hybrid = pd.DataFrame([f['properties'] for f in data['features']])

    casesSummary = getCaseSummary(counties)
    vaxSummary = getVaxSummary(hybrid)
    equitySummary = getEquitySummary(counties)
   
    with open(os.path.join(repo_root, 'src/meta/summary.js'), 'w') as outfile:
        json.dump({"cases": casesSummary,"vaccination":vaxSummary,"equity":equitySummary}, outfile)
        
    with open(os.path.join(repo_root, 'src/meta/summary.js'), 'r+') as f:
        content = f.read()
        f.seek(0, 0)
        f.write('export const summary = ' + content)
    