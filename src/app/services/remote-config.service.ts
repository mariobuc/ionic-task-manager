import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
import { fetchAndActivate, getBoolean, getRemoteConfig, isSupported } from 'firebase/remote-config';

const FEATURE_FLAG_KEY = 'category_insights_enabled';

@Injectable({
  providedIn: 'root',
})
export class RemoteConfigService {
  private readonly categoryInsightsEnabledSubject = new BehaviorSubject<boolean>(false);
  readonly categoryInsightsEnabled$ = this.categoryInsightsEnabledSubject.asObservable();

  constructor() {
    void this.initialize();
  }

  private async initialize(): Promise<void> {
    const firebaseConfig = environment.firebase as FirebaseOptions;

    if (!this.hasFirebaseConfig(firebaseConfig)) {
      return;
    }

    if (!(await isSupported())) {
      return;
    }

    const app = this.getOrCreateApp(firebaseConfig);
    const remoteConfig = getRemoteConfig(app);

    remoteConfig.settings = {
      fetchTimeoutMillis: 10_000,
      minimumFetchIntervalMillis: environment.production ? 3_600_000 : 0,
    };

    remoteConfig.defaultConfig = environment.remoteConfigDefaults;

    try {
      await fetchAndActivate(remoteConfig);
      this.categoryInsightsEnabledSubject.next(getBoolean(remoteConfig, FEATURE_FLAG_KEY));
    } catch {
      this.categoryInsightsEnabledSubject.next(
        environment.remoteConfigDefaults[FEATURE_FLAG_KEY] === 'true'
      );
    }
  }

  private getOrCreateApp(firebaseConfig: FirebaseOptions): FirebaseApp {
    return getApps().length ? getApp() : initializeApp(firebaseConfig);
  }

  private hasFirebaseConfig(firebaseConfig: FirebaseOptions | undefined): boolean {
    return Boolean(
      firebaseConfig?.apiKey &&
        firebaseConfig?.authDomain &&
        firebaseConfig?.projectId &&
        firebaseConfig?.appId &&
        firebaseConfig?.messagingSenderId
    );
  }
}
