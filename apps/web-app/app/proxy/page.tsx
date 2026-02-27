import EndpointsPageClient from "./EndpointsPageClient";
import {
  listRoutesAction,
  createRouteAction,
  updateRouteAction,
  deleteRouteAction,
} from "./actions";

export const dynamic = "force-dynamic";

const SYSTEM_DOMAIN = "proxy.localhost:4000";

export default async function Page() {
  const routes = await listRoutesAction();
  const endpoints = routes

  return (
    <EndpointsPageClient
      systemDomain={SYSTEM_DOMAIN}
      initialEndpoints={endpoints}
      createRouteAction={createRouteAction}
      updateRouteAction={updateRouteAction}
      deleteRouteAction={deleteRouteAction}
    />
  );
}
