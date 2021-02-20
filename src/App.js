import React, { Component, Suspense  } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
 
import {Home, LoadingMessage, ErrorPage} from './components/';
 
const Map = React.lazy(() => import('./components/Pages/Map'));
const About = React.lazy(() => import('./components/Pages/About'));
const Api = React.lazy(() => import('./components/Pages/Api'));
const Data = React.lazy(() => import('./components/Pages/Data'));
const Contact = React.lazy(() => import('./components/Pages/Contact'));
const Insights = React.lazy(() => import('./components/Pages/Insights'));
const Methodology = React.lazy(() => import('./components/Pages/Methodology'));
const Time = React.lazy(() => import('./components/Pages/Time'));
const Choropleth = React.lazy(() => import('./components/Pages/Choropleth'));
const Hotspots = React.lazy(() => import('./components/Pages/Hotspots'));
const Trends = React.lazy(() => import('./components/Pages/Trends'));
const Faq = React.lazy(() => import('./components/Pages/Faq'));

class App extends Component {

  render() {
    return (     
       <Router basename={process.env.PUBLIC_URL}>
        <div>
          <Suspense fallback={<LoadingMessage />}>
              <Switch>
                <Route path="/" component={Home} exact/>
                <Route path="/map" component={Map}/>
                <Route path="/map.html" component={Map}/>
                <Route path="/about" component={About}/>
                <Route path="/about.html" component={About}/>
                <Route path="/contact" component={Contact}/>
                <Route path="/contact.html" component={Contact}/>
                <Route path="/insights" component={Insights}/>
                <Route path="/api" component={Api}/>
                <Route path="/api.html" component={Api}/>
                <Route path="/data" component={Data}/>
                <Route path="/data.html" component={Data}/>
                <Route path="/methods" component={Methodology}/>
                <Route path="/methods.html" component={Methodology}/>
                <Route path="/time" component={Time}/>
                <Route path="/time.html" component={Time}/>
                <Route path="/choropleth" component={Choropleth}/>
                <Route path="/choropleth.html" component={Choropleth}/>
                <Route path="/hotspot" component={Hotspots}/>
                <Route path="/hotspot.html" component={Hotspots}/>
                <Route path="/trends" component={Trends}/>
                <Route path="/trends.html" component={Trends}/>
                <Route path="/faq" component={Faq}/>
                <Route path="/faq.html" component={Faq}/>
                <Route component={ErrorPage} />
                <Route />
            </Switch>
          </Suspense>
        </div> 
      </Router>
    );
  }
}

export default App