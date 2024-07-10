import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";

// Initialize Apollo client
const graphQLClient = new ApolloClient({
  ssrMode: true, // Indicates that we want to use server side rendering
  link: createHttpLink({
    // Use createHttpLink instead of uri
    uri: "http://localhost:4000/", //Path to GraphQL schema
    headers: {
      "Access-Control-Allow-Origin": "*", //Cors management
    },
  }),
  cache: new InMemoryCache(), // Cache management
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ApolloProvider client={graphQLClient}>
          <Outlet />
          <ScrollRestoration />
          <LiveReload />
          <Scripts />
        </ApolloProvider>
      </body>
    </html>
  );
}
