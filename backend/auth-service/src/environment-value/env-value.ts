export class EnvValue {
    // domain_test: "localhost",
    // domain_deployed: "34.58.241.34",
    // public static domain = "34.58.241.34";
    public static domain = "localhost";
    public static backend_port = 3003;

    // http://localhost:8000/login
    //public static redirect_uri = `http://34.58.241.34:8000/login`;
     public static redirect_uri = `http://localhost:8000/login`;

    //origin
    // origin: [`http://localhost:8000`, `http://localhost:8001`], // frontend URLs
    //public static origin = [`http://34.58.241.34:8000`, `http://34.58.241.34:8001`, `http://34.58.241.34:8002`];
    public static origin: [`http://localhost:8000`, `http://localhost:8001`] // frontend URLs

    //static readonly corsOrigins: string[] = process.env.CORS_ORIGINS?.split(',') || [];
}