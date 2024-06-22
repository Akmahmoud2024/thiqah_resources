import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { AppModule } from "./app/app.module";
import { enableProdMode } from "@angular/core";
import { ConfigService } from "thiqah-res";

const envConfigService = new ConfigService<any>();

envConfigService.init().then(() => {
  if (envConfigService.getOne("production")) {
    enableProdMode();
  }
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
});
