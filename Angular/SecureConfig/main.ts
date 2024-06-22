import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { AppModule } from "./app/app.module";
import { enableProdMode } from "@angular/core";
import { ConfigService } from "thiqah-res";
import { AppConfig } from "./shared/models/app-config";

const envConfigService = new ConfigService<AppConfig>();

envConfigService.init().then(() => {
  if (envConfigService.getOne("production")) {
    enableProdMode();
  }
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
});
