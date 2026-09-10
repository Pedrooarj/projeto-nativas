import { app } from "./app";
import { env } from "./shared/env";

app.listen(env.PORT, () => {
  console.log(`API do Nativas em http://localhost:${env.PORT}`);
});
