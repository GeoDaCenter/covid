import pandas as pd
import requests
import lxml.html as lh

def read_table_NY(url):
    page = requests.get(url)
    doc = lh.fromstring(page.content)
    tr_elements = doc.xpath('//tr')
    col=[]
    i=0
    for t in tr_elements[0]:
        i+=1
        name=t.text_content()
        #print ('%d:"%s"' % (i,name))
        col.append((name,[]))    
    for j in range(1,len(tr_elements)):
        T=tr_elements[j]
        if len(T)!=8:
            break
        i=0
        for t in T.iterchildren():
            data=t.text_content() 
            if i>0:
                try:
                    data=int(data)
                except:
                        pass
            col[i][1].append(data)
            i+=1
    Dict={title:column for (title,column) in col}
    df=pd.DataFrame(Dict)
    df=df[['County', 'TotalTests']]
    df.drop(df.index[:1], inplace=True)
    df.drop(df.tail(2).index,inplace=True)
    df['County'] = df['County'].replace(r'\n','', regex = True)
    df['County'] = df['County'].replace(' ','', regex = True)
    df['TotalTests'] = df['TotalTests'].replace(r'\s','', regex = True).str.replace(',','').astype(int)
    return df

def read_table_WA(url):
    page = requests.get(url)
    doc = lh.fromstring(page.content)
    tr_elements = doc.xpath('//tr')
    col=[]
    i=0
    for t in tr_elements[0]:
        i+=1
        name=t.text_content()
        #print ('%d:"%s"' % (i,name))
        col.append((name,[]))    
    for j in range(1,len(tr_elements)):
        T=tr_elements[j]
        if len(T)!=8:
            break
        i=0
        for t in T.iterchildren():
            data=t.text_content() 
            if i>0:
                try:
                    data=int(data)
                except:
                        pass
            col[i][1].append(data)
            i+=1
    Dict={title:column for (title,column) in col}
    df=pd.DataFrame(Dict)
    df=df[['County', 'TotalTests']]
    df.drop(df.index[:1], inplace=True)
    df.drop(df.tail(2).index,inplace=True)
    df['County'] = df['County'].replace(r'\n','', regex = True)
    df['County'] = df['County'].replace(' ','', regex = True)
    df['TotalTests'] = df['TotalTests'].astype(str)
    df['TotalTests'] = df['TotalTests'].replace(r'\s','', regex = True).str.replace(',','').astype(int)
    return df

def read_table_TX(url):
    page = requests.get(url)
    doc = lh.fromstring(page.content)
    tr_elements = doc.xpath('//tr')
    col=[]
    i=0
    for t in tr_elements[0]:
        i+=1
        name=t.text_content()
        #print ('%d:"%s"' % (i,name))
        col.append((name,[]))    
    for j in range(1,len(tr_elements)):
        T=tr_elements[j]
        if len(T)!=8:
            break
        i=0
        for t in T.iterchildren():
            data=t.text_content() 
            if i>0:
                try:
                    data=int(data)
                except:
                        pass
            col[i][1].append(data)
            i+=1
    Dict={title:column for (title,column) in col}
    df=pd.DataFrame(Dict)
    df=df[['County', 'TotalTests']]
    df.drop(df.index[:1], inplace=True)
    df.drop(df.tail(2).index,inplace=True)
    df['County'] = df['County'].replace(r'\n','', regex = True)
    df['County'] = df['County'].replace(' ','', regex = True)
    df['TotalTests'] = df['TotalTests'].astype(str)
    df['TotalTests'] = df['TotalTests'].replace(r'\s','', regex = True).str.replace(',','')
    return df