import React, { Suspense } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import {
  ThemeProvider,
  StyledEngineProvider,
  createTheme,
} from "@mui/material/styles";
import { Home, LoadingMessage, ErrorPage } from "./components/";
import colors from "./config/colors";
import useTrackUserActions from "./hooks/useTrackUserActions.js";

const About = React.lazy(() => import("./components/Pages/About"));
const Api = React.lazy(() => import("./components/Pages/Api"));
const Cab = React.lazy(() => import("./components/Pages/Cab"));
const Choropleth = React.lazy(() => import("./components/Pages/Choropleth"));
const CodeOfConduct = React.lazy(() =>
  import("./components/Pages/CodeOfConduct")
);
const Contact = React.lazy(() => import("./components/Pages/Contact"));
const Data = React.lazy(() => import("./components/Pages/Data"));
const DataLoading = React.lazy(() => import("./components/Pages/DataLoading"));
const Download = React.lazy(() => import("./components/Pages/Download"));
const Faq = React.lazy(() => import("./components/Pages/Faq"));
const Hotspots = React.lazy(() => import("./components/Pages/Hotspots"));
const Insights = React.lazy(() => import("./components/Pages/Insights"));
const Map = React.lazy(() => import("./components/Pages/Map"));
const MichiganMasks = React.lazy(() =>
  import("./components/Pages/MichiganMasks")
);
const Methodology = React.lazy(() => import("./components/Pages/Methodology"));
const PrivacyPolicy = React.lazy(() =>
  import("./components/Pages/PrivacyPolicy")
);
const Time = React.lazy(() => import("./components/Pages/Time"));
const Trends = React.lazy(() => import("./components/Pages/Trends"));

const theme = createTheme({
  typography: {
    fontFamily: "'Lato', sans-serif",
  },
  palette: {
    type: 'dark',
    background: {
      default: '#000000',
    },
    text: {
      primary: '#fff6f6',
    },
    primary: {
      // light: will be calculated from palette.primary.main,
      main: colors.yellow,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      light: "#0066ff",
      main: "#0044ff",
      // dark: will be calculated from palette.secondary.main,
      contrastText: "#ffcc00",
    },
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: 3,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: 0.2,
  },
  overrides: {
    MuiTooltip: {
      borderRadius: 0,
      tooltip: {
        borderRadius: 0,
      },
    },
    MuiPopper: {
      borderRadius: 0,
      tooltip: {
        borderRadius: 0,
      },
    },
    MuiPaper: {
      backgroundColor:'red',
    }
  }
});

export default function App() {
  useTrackUserActions();
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div>
        <Suspense fallback={<LoadingMessage />}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <Switch>
                <Route path="/" component={Home} exact />
                <Route path="/map" component={Map} />
                <Route path="/map.html" component={Map} />
                <Route path="/about" component={About} />
                <Route path="/about.html" component={About} />
                <Route path="/cab" component={Cab} />
                <Route path="/contact" component={Contact} />
                <Route path="/contact.html" component={Contact} />
                <Route path="/insights" component={Insights} />
                <Route path="/api" component={Api} />
                <Route path="/api.html" component={Api} />
                <Route path="/data" component={Data} />
                <Route path="/data.html" component={Data} />
                <Route path="/data-loading" component={DataLoading} />
                <Route path="/data-loading.html" component={DataLoading} />
                <Route path="/docs" component={Data} />
                <Route path="/docs.html" component={Data} />
                <Route path="/download" component={Download} />
                <Route path="/download.html" component={Download} />
                <Route path="/michigan-masks" component={MichiganMasks} />
                <Route path="/michigan-masks.html" component={MichiganMasks} />
                <Route path="/methods" component={Methodology} />
                <Route path="/methods.html" component={Methodology} />
                <Route path="/time" component={Time} />
                <Route path="/time.html" component={Time} />
                <Route path="/choropleth" component={Choropleth} />
                <Route path="/choropleth.html" component={Choropleth} />
                <Route path="/hotspot" component={Hotspots} />
                <Route path="/hotspot.html" component={Hotspots} />
                <Route path="/trends" component={Trends} />
                <Route path="/trends.html" component={Trends} />
                <Route path="/faq" component={Faq} />
                <Route path="/faq.html" component={Faq} />
                <Route path="/conduct" component={CodeOfConduct} />
                <Route path="/conduct.html" component={CodeOfConduct} />
                <Route path="/privacy" component={PrivacyPolicy} />
                <Route
                  path="/500000"
                  exact
                  component={() => {
                    window.location.href = `/500000/index.html`;
                    return null;
                  }}
                />
                <Route component={ErrorPage} />
                <Route />
              </Switch>
            </ThemeProvider>
          </StyledEngineProvider>
        </Suspense>
      </div>
    </Router>
  );
}
