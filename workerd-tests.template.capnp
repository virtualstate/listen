# Imports the base schema for workerd configuration files.

# Refer to the comments in /src/workerd/server/workerd.capnp for more details.

using Workerd = import "/workerd/workerd.capnp";

const network :Workerd.Network = (
  allow = ["public"]
);

# A constant of type Workerd.Config defines the top-level configuration for an
# instance of the workerd runtime. A single config file can contain multiple
# Workerd.Config definitions and must have at least one.
const config :Workerd.Config = (

  # Every workerd instance consists of a set of named services. A worker, for instance,
  # is a type of service. Other types of services can include external servers, the
  # ability to talk to a network, or accessing a disk directory. Here we create a single
  # worker service. The configuration details for the worker are defined below.
  services = [ (name = "main", worker = .test) ],

  # Every configuration defines the one or more sockets on which the server will listen.
  # Here, we create a single socket that will listen on localhost port 3000, and will
  # dispatch to the "main" service that we defined above.
  sockets = [ ( name = "http", address = "*:3000", http = (), service = "main" ) ]
);

# The definition of the actual worker exposed using the "main" service.
# In this example the worker is implemented as a single simple script.
# The compatibilityDate is required. For more details on compatibility dates see:
#   https://developers.cloudflare.com/workers/platform/compatibility-dates/

# const test :Workerd.Worker = (
#   modules = [
#    (name = "esnext-workerd/tests/workerd/test.js", esModule = embed "esnext-workerd/tests/workerd/test.js")
#   ],
#   compatibilityDate = "2022-09-16",
# );