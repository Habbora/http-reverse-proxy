import EndpointsPageClient from "./EndpointsPageClient";
import {
  listRoutesAction,
  createRouteAction,
  updateRouteAction,
  deleteRouteAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function Page() {
  const routes = await listRoutesAction();
  const endpoints = routes

  return (
    <EndpointsPageClient
      initialEndpoints={endpoints}
      createRouteAction={createRouteAction}
      updateRouteAction={updateRouteAction}
      deleteRouteAction={deleteRouteAction}
    />
  );
}
