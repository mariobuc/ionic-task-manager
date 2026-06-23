// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyDy4ckOBuOYT5wXmkKZXjc5IuZaDTUB4DU",
    authDomain: "ionic-task-manager-8aa4f.firebaseapp.com",
    projectId: "ionic-task-manager-8aa4f",
    storageBucket: "ionic-task-manager-8aa4f.firebasestorage.app",
    messagingSenderId: "140769959464",
    appId: "1:140769959464:web:2e28a9ea9260fbd0db9f1d",
    measurementId: "G-CRJL1RH04E",
  },
  remoteConfigDefaults: {
    category_insights_enabled: 'false',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
