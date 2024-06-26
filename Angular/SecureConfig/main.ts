import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { AppModule } from "./app/app.module";
import { enableProdMode } from "@angular/core";
import { EnvironmentConfigService } from "@thiqah/shared-lib";
import { AppConfig } from "./shared/models/app-config";

const envConfigService = new EnvironmentConfigService();

envConfigService.load(true).then(() => {
  if (envConfigService.getOne("production")) {
    enableProdMode();
  }
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
});
