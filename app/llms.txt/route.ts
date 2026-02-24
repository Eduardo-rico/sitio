import { getSiteUrl } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  const siteUrl = getSiteUrl();
  const content = `# Eduardo Rico
> Plataforma educativa para aprender Python, ciencia de datos e inteligencia artificial en español.

## Qué es este sitio
- Tutoriales interactivos de Python con editor y consola integrada.
- Lecciones con retos prácticos y validación automática de código.
- Blog técnico sobre Python, ML, NLP y redes neuronales.

## URLs principales
- Inicio: ${siteUrl}
- Tutoriales: ${siteUrl}/tutoriales
- Curso Python Básico: ${siteUrl}/tutoriales/python-basico
- Curso Python Intermedio: ${siteUrl}/tutoriales/python-intermedio
- Blog: ${siteUrl}/posts
- CV profesional: ${siteUrl}/cv

## Público objetivo
- Personas hispanohablantes que quieren aprender programación con práctica real.
- Estudiantes de Python desde nivel básico hasta intermedio.

## Contacto
- LinkedIn: https://www.linkedin.com/in/eduardo-rico-sotomayor/
- GitHub: https://github.com/Eduardo-rico
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
