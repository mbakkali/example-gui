import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import {Amplify} from "aws-amplify";

if (environment.production) {
  enableProdMode();
}
export const awsmobile = {
  "aws_project_region": "eu-west-3",
  "aws_cognito_region": "eu-west-3",
  "aws_user_pools_id": "eu-west-3_VmZn1mwPY",
  "aws_user_pools_web_client_id": "45g49p0hcqrpn91kblgqbl6d7f",
  "oauth": {
    "domain": "alimo.auth.eu-west-3.amazoncognito.com",
    "scope": [
      "phone",
      "email",
      "openid",
      "profile",
      "aws.cognito.signin.user.admin"
    ],
    "redirectSignIn": "http://localhost:4205/login",
    "redirectSignOut": "http://localhost:4205/login",
    "responseType": "code"
  }
};

Amplify.configure(awsmobile);


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
