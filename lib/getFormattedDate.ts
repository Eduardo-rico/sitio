export default function getFormattedDate(dateString: string): string {
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date(dateString))
}