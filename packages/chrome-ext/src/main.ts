import { ClipboardService } from './services/clipboardService';
import { SiteFormComponent } from './components/siteForm';
import { NavigationService } from './services/navigationService';
import { VaultService } from './services/vaultService';
import { SitesListComponent } from './components/sitesList';
import { AppComponent } from './components/app';
import { ToolbarComponent } from './components/toolbar';
import { ContentComponent } from './components/content';
import { LoginComponent} from './components/login';
import * as ng from 'angular';


const appModule = ng.module('app', ['ngMaterial']);
appModule.component('app', AppComponent);
appModule.component('toolbar', ToolbarComponent);
appModule.component('content', ContentComponent);
appModule.component('loginScreen', LoginComponent);
appModule.component('sitesList', SitesListComponent);
appModule.component('siteForm', SiteFormComponent);
appModule.service('vault', VaultService);
appModule.service('navigation', NavigationService);
appModule.service('clipboard', ClipboardService);
