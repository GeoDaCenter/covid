from bs4 import BeautifulSoup
import csv, requests, os
import pandas as pd

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

# Main function that scrapes the HRSA pages by states and updates the current list
# Takes a list of US state 2-letter names and returs 3 dataframes: 
# one missing data, one of clinics ready to go (clean), and one with everything
def scrapeHrsa(pageList):
    # loop through pages
    for idx, abr in enumerate(pageList):
        # request page, find the table element with the clinic status
        page = requests.get(f'https://www.hrsa.gov/coronavirus/health-center-program/participants/{abr}')
        html = page.text
        soup = BeautifulSoup(html, features="html.parser")
        table = soup.find('table')

        # declare an output array
        output_rows = []
        # loop through the table rows 'tr' to find the headers below
        columnHeaders = ['Health Center Name', 'City', 'State', 'Status']
        for table_row in table.findAll('tr'):
            columns = table_row.findAll('td')
            if len(columns) == 0:
                continue
            output_row = {}
            for i in range(0, 4):
                output_row[columnHeaders[i]] = columns[i].text
            output_rows.append(output_row)

        # dump collection into a dataframe (or append if not the first iteration)
        if idx == 0:
            combinedDf = pd.DataFrame(output_rows)
        else:
            combinedDf = pd.concat([combinedDf, pd.DataFrame(output_rows)])

    # load in existing geocoded clinics, and merge    
    geocodedClinics = pd.read_csv(os.path.join(repo_root,'data-scripts/hrsa/full_clinics_geocoded.csv'))
    merged = combinedDf.merge(geocodedClinics, on=["Health Center Name", 'City', 'State'], how="left")
    
    return {
        'missingData':merged[merged.address.isnull()],
        'clinics':merged[merged.address.notnull()],
        'full':combinedDf
    }

# read in past data for federal sites (doesn't change for now). 
# the type column defines invited clinics (0), participating clinics (1), and federal sites (3)
def getFederalSites():
    pastData = pd.read_csv(os.path.join(repo_root,'public/csv/context_vaccination_sites_hrsa_wh.csv'))
    return pastData[pastData.type==3]

# Gets data from Google Places API based on a dataframe
# We use the google places API because we lack info beyond the name, city and state
def handleMissingData(placeList):
    return []
    API_KEY = ''# GCP PLACES AND MAPS API KEY HERE but not on github pls
    
    # Simple lambda function to make a single query for google places / maps api
    def combineKey(row):
        return f'{row["Health Center Name"]}, {row["City"]}, {row["State"]}'
    
    # declare blank columns to be filled in later
    placeList['lat'] = None
    placeList['lon'] = None
    placeList['address'] = ''
    placeList['phone'] = ''
    placeList['combinedKey'] = placeList.apply(lambda x: combineKey(x), axis=1)
    
    # first, fetch the google place IDs based on the combined key from above
    placeIDs = []
    for PLACE in placeList[placeList.lat.isnull()]['combinedKey']:
        rtn = requests.get(f'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?key={API_KEY}&input={PLACE}&inputtype=textquery')
        placeIDs.append({
            'name': PLACE,
            'candidates': rtn.json()['candidates']
        })
        
    # then, get the full place details from the details API
    for i in range(0, len(placeIDs)):
        details = []
        for Candidate in placeIDs[i]['candidates']:
            rtn = requests.get(f'https://maps.googleapis.com/maps/api/place/details/json?key={API_KEY}&place_id={Candidate["place_id"]}')
            details.append(rtn.json())
        placeIDs[i]['details'] = details
    
    # finally, clean it up and try to populate all the data it has. This is messy!
    for place in placeIDs:
        if (len(place['details']) == 0):
            continue
        place['result'] = place['details'][0]
        
    cleanData = []
    
    for place in placeIDs:
        if (len(place['details']) == 0):
            continue

        tempObj = {}

        try:
            tempObj['combinedKey'] = place['name'],
        except:
            pass

        try:
            tempObj['name'] = place['result']['result']['name']
        except:
            pass

        try:
            tempObj['address'] = place['result']['result']['formatted_address']
        except:
            pass

        try:
            tempObj['contact'] = place['result']['result']['formatted_phone_number']
        except:
            pass

        try:
            tempObj['lat'] = place['result']['result']['geometry']['location']['lat']
        except:
            pass

        try:
            tempObj['lon'] = place['result']['result']['geometry']['location']['lng']
        except:
            pass

        cleanData.append(tempObj)
    
    cleanLocations = pd.DataFrame(cleanData)
    return cleanLocations
    # cleanLocations['combinedKey'] = cleanLocations.combinedKey.astype(str).str.slice(2,-3)
    
    # return cleanLocations

# To avoid re-running google queries, this updates the csv with new locations after each run
def updateGeocodedList(newData):
    # call geocoded csv
    geocodedClinics = pd.read_csv(os.path.join(repo_root,'data-scripts/hrsa/full_clinics_geocoded.csv'))
    # filter out new entries
    geocodedClinics = geocodedClinics[~geocodedClinics['Health Center Name'].isin(newData['Health Center Name'])]
    # concat with new data and return
    combinedData = pd.concat([geocodedClinics, newData], sort=False)
    return combinedData

# one final clean before export
def cleanAndExport(clinicData, federalData):
    geocodedClinics = pd.read_csv(os.path.join(repo_root,'data-scripts/hrsa/full_clinics_geocoded.csv'))
    # merge with geocoded
    merged = clinicData.merge(geocodedClinics, on=["Health Center Name", 'City', 'State'], how="left")
    # drop missing geometry
    merged = merged[merged.lat.notnull()]
    
    def translateStatus(val):
        if val == 'Invited':
            return 0
        else:
            return 1
        
    merged['Status'] = merged['Status'].apply(lambda x: translateStatus(x))
    cleaned = merged[['name','lon','lat','Status','address','contact']]
    cleaned.columns = ['name','lon','lat','type','address','phone']
    
    return pd.concat([federalData, cleaned], sort=False)    

if __name__ == "__main__":
    # Scrape Current Data
    pageList = ['AL','AK','AS','AZ','AR','CA','CO','CT','DE','DC','FM','FL','GA','GU','HI','ID','IL','IN','IA','KS','KY','LA','ME','MH','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PW','PA','PR','RI','SC','SD','TN','TX','UT','VT','VI','VA','WA','WV','WI','WY']
    currentData = scrapeHrsa(pageList)

    # Get Past Data
    federalSites = getFederalSites()

    # Handle Missing Entries
    try:
        newData = handleMissingData(currentData['missingData'])
        # newData['combinedKey'] = newData.combinedKey.astype(str).str.slice(2,-3)

        joinedNewData = currentData['missingData'][['Health Center Name', 'City', 'State', 'combinedKey']] \
            .merge(newData, how="left", on="combinedKey")

        # Combine New Data
        newGeocodedData = updateGeocodedList(joinedNewData)
        newGeocodedData[['City', 'Health Center Name', 'State', 'address',
            'combinedKey', 'contact', 'lat', 'lon', 'name']].to_csv('full_clinics_geocoded.csv',index=False)
    except:
        ## data can't be found :/
        pass

    cleanedData = cleanAndExport(currentData['full'], federalSites)
    cleanedData.to_csv(os.path.join(repo_root,'public/csv/context_vaccination_sites_hrsa_wh.csv'), index=False)