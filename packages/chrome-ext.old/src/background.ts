import { Vault } from '../../js-sdk/vaultage';
import { BackgroundPage } from './interfaces/BackgroundPage';

let background: BackgroundPage = window as any;

background.vault = new Vault();
