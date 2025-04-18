export class EnvValue {
    // domain_test: "localhost",
    // domain_deployed: "34.58.241.34",
    // public static domain = "34.58.241.34";
    // 127.11.0.1
    public static domain = process.env.DOMAIN || 'localhost';
    public static port = process.env.PORT || '3003';

    public static readonly USER_URL = process.env.USER_URL || 'http://127.11.0.1:8000';
    public static readonly SELLER_URL = process.env.SELLER_URL || 'http://127.11.0.1:8001';
    public static readonly ADMIN_URL = process.env.ADMIN_URL || 'http://127.11.0.1:8002';

    // http://localhost:8000/login
    //public static redirect_uri = `http://34.58.241.34:8000/login`;

    //public static redirect_uri = `http://localhost:8000/login`;

    //origin
    // origin: [`http://localhost:8000`, `http://localhost:8001`], // frontend URLs
    //public static origin = [`http://34.58.241.34:8000`, `http://34.58.241.34:8001`, `http://34.58.241.34:8002`];
    //public static origin: [`http://localhost:8000`, `http://localhost:8001`] // frontend URLs

    //static readonly corsOrigins: string[] = process.env.CORS_ORIGINS?.split(',') || [];

     public static redirect_uri = `${process.env.USER_URL}/login`;
}