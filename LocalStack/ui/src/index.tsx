import React from 'react';
import ReactDOM from 'react-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { DockerMuiThemeProvider } from '@docker/docker-mui-theme';

import { App } from './App';
import { GlobalDDProvide } from './components/provider';

ReactDOM.render(
  <React.StrictMode>
    {/*
      If you eject from MUI (which we don't recommend!), you should add
      the `dockerDesktopTheme` class to your root <html> element to get
      some minimal Docker theming.
    */}
    <DockerMuiThemeProvider>
      <GlobalDDProvide>
        <CssBaseline />
        <App />
      </GlobalDDProvide>
    </DockerMuiThemeProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
