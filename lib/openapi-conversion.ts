// Removed static import in favor of dynamic imports to fix webpack HMD issues
// import $RefParser from "@apidevtools/json-schema-ref-parser"

interface OpenAPIData {
  info: {
    title: string
    description: string
    server: string
  }
  routes: {
    path: string
    method: string
    operationId: string
    requestInBody?: boolean
  }[]
  functions: any
}

export const validateOpenAPI = async (openapiSpec: any) => {
  // Dereference the spec if needed
  let dereferenced = openapiSpec
  try {
    const RefParser = (await import("@apidevtools/json-schema-ref-parser"))
      .default
    dereferenced = await RefParser.dereference(openapiSpec)
  } catch (error) {
    console.warn("Could not dereference OpenAPI spec:", error)
    // Continue with the original spec
  }

  if (!dereferenced.info) {
    throw new Error("('info'): field required")
  }

  if (!dereferenced.info.title) {
    throw new Error("('info', 'title'): field required")
  }

  if (!dereferenced.info.version) {
    throw new Error("('info', 'version'): field required")
  }

  if (
    !dereferenced.servers ||
    !dereferenced.servers.length ||
    !dereferenced.servers[0].url
  ) {
    throw new Error("Could not find a valid URL in `servers`")
  }

  if (!dereferenced.paths || Object.keys(dereferenced.paths).length === 0) {
    throw new Error("No paths found in the OpenAPI spec")
  }

  Object.keys(dereferenced.paths).forEach(path => {
    if (!path.startsWith("/")) {
      throw new Error(`Path ${path} does not start with a slash; skipping`)
    }
  })

  if (
    Object.values(dereferenced.paths).some((methods: any) =>
      Object.values(methods).some((spec: any) => !spec.operationId)
    )
  ) {
    throw new Error("Some methods are missing operationId")
  }

  if (
    Object.values(dereferenced.paths).some((methods: any) =>
      Object.values(methods).some(
        (spec: any) => spec.requestBody && !spec.requestBody.content
      )
    )
  ) {
    throw new Error(
      "Some methods with a requestBody are missing requestBody.content"
    )
  }

  if (
    Object.values(dereferenced.paths).some((methods: any) =>
      Object.values(methods).some((spec: any) => {
        if (spec.requestBody?.content?.["application/json"]?.schema) {
          if (
            !spec.requestBody.content["application/json"].schema.properties ||
            Object.keys(spec.requestBody.content["application/json"].schema)
              .length === 0
          ) {
            throw new Error(
              `In context=('paths', '${Object.keys(methods)[0]}', '${
                Object.keys(spec)[0]
              }', 'requestBody', 'content', 'application/json', 'schema'), object schema missing properties`
            )
          }
        }
      })
    )
  ) {
    throw new Error("Some object schemas are missing properties")
  }
}

export const openapiToFunctions = async (
  openapiSpec: any
): Promise<OpenAPIData> => {
  const functions: any[] = [] // Define a proper type for function objects
  const routes: {
    path: string
    method: string
    operationId: string
    requestInBody?: boolean // Add a flag to indicate if the request should be in the body
  }[] = []

  for (const [path, methods] of Object.entries(openapiSpec.paths)) {
    if (typeof methods !== "object" || methods === null) {
      continue
    }

    for (const [method, specWithRef] of Object.entries(
      methods as Record<string, any>
    )) {
      // Use a try-catch block to handle potential errors with dereference
      let spec: any
      try {
        // Import the parser dynamically only when needed
        const RefParser = (await import("@apidevtools/json-schema-ref-parser"))
          .default
        spec = await RefParser.dereference(specWithRef)
      } catch (error) {
        // Fallback if dereference fails
        console.error("Error dereferencing schema:", error)
        spec = specWithRef
      }

      const functionName = spec.operationId
      const desc = spec.description || spec.summary || ""

      const schema: { type: string; properties: any; required?: string[] } = {
        type: "object",
        properties: {}
      }

      const reqBody = spec.requestBody?.content?.["application/json"]?.schema
      if (reqBody) {
        schema.properties.requestBody = reqBody
      }

      const params = spec.parameters || []
      if (params.length > 0) {
        const paramProperties = params.reduce((acc: any, param: any) => {
          if (param.schema) {
            acc[param.name] = param.schema
          }
          return acc
        }, {})

        schema.properties.parameters = {
          type: "object",
          properties: paramProperties
        }
      }

      functions.push({
        type: "function",
        function: {
          name: functionName,
          description: desc,
          parameters: schema
        }
      })

      // Determine if the request should be in the body based on the presence of requestBody
      const requestInBody = !!spec.requestBody

      routes.push({
        path,
        method,
        operationId: functionName,
        requestInBody // Include this flag in the route information
      })
    }
  }

  return {
    info: {
      title: openapiSpec.info.title,
      description: openapiSpec.info.description,
      server: openapiSpec.servers[0].url
    },
    routes,
    functions
  }
}
