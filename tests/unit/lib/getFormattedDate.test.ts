import { describe, it, expect } from 'vitest';
import getFormattedDate from '@/lib/getFormattedDate';

describe('getFormattedDate', () => {
  it('should format ISO date string (YYYY-MM-DD) to Spanish long format', () => {
    // Arrange
    const dateString = '2024-03-15';

    // Act
    const result = getFormattedDate(dateString);

    // Assert - Expected format: "15 de marzo de 2024" (es-MX, dateStyle: 'long')
    // Note: Due to timezone conversion, the day might vary by 1 depending on local timezone
    expect(result).toMatch(/^\d{1,2} de marzo de 2024$/);
    expect(result.toLowerCase()).toContain('marzo');
    expect(result).toContain('2024');
  });

  it('should format ISO date string with timezone to Spanish long format', () => {
    // Arrange
    const dateString = '2024-12-25T00:00:00.000Z';

    // Act
    const result = getFormattedDate(dateString);

    // Assert - Expected format: "24 de diciembre de 2024" or "25 de diciembre de 2024" 
    // depending on local timezone offset
    expect(result).toMatch(/^\d{1,2} de diciembre de 2024$/);
    expect(result.toLowerCase()).toContain('diciembre');
    expect(result).toContain('2024');
  });

  it('should format date in Spanish (es-MX) locale', () => {
    // Arrange
    const dateString = '2024-06-20';

    // Act
    const result = getFormattedDate(dateString);

    // Assert - Month should be in Spanish
    expect(result.toLowerCase()).toContain('junio');
    expect(result).toContain('de');
    expect(result).toContain('2024');
    // Format pattern: day + "de" + month + "de" + year
    expect(result).toMatch(/^\d{1,2} de \w+ de \d{4}$/);
  });

  it('should use dateStyle: long format', () => {
    // Arrange
    const dateString = '2024-01-05';

    // Act
    const result = getFormattedDate(dateString);

    // Assert - Long format includes: day number, month name, year
    // Pattern: "5 de enero de 2024" (or "4 de enero de 2024" depending on timezone)
    expect(result).toMatch(/^\d{1,2} de \w+ de \d{4}$/);
    expect(result.toLowerCase()).toContain('enero');
    expect(result).toContain('2024');
  });

  it('should throw error for invalid date string', () => {
    // Arrange
    const invalidDate = 'invalid-date';

    // Act & Assert
    expect(() => getFormattedDate(invalidDate)).toThrow();
  });

  it('should throw error for empty string', () => {
    // Arrange
    const emptyDate = '';

    // Act & Assert
    expect(() => getFormattedDate(emptyDate)).toThrow();
  });

  it('should handle different date separators', () => {
    // Arrange
    const dateString = '2024/07/10';

    // Act
    const result = getFormattedDate(dateString);

    // Assert
    expect(result).toContain('2024');
    expect(result.toLowerCase()).toContain('julio');
    expect(result).toMatch(/^\d{1,2} de \w+ de \d{4}$/);
  });

  it('should handle Date object compatible strings', () => {
    // Arrange
    const dateString = 'August 15, 2024';

    // Act
    const result = getFormattedDate(dateString);

    // Assert
    expect(result).toContain('2024');
    expect(result.toLowerCase()).toContain('agosto');
    expect(result).toMatch(/^\d{1,2} de \w+ de \d{4}$/);
  });

  it('should format dates at year boundaries', () => {
    // Arrange
    const newYearDate = '2024-01-01';
    const endOfYearDate = '2024-12-31';

    // Act
    const newYearResult = getFormattedDate(newYearDate);
    const endOfYearResult = getFormattedDate(endOfYearDate);

    // Assert - Results depend on local timezone
    expect(newYearResult).toMatch(/^\d{1,2} de \w+ de (2023|2024)$/);
    expect(endOfYearResult).toMatch(/^\d{1,2} de \w+ de 2024$/);
    expect(endOfYearResult.toLowerCase()).toContain('diciembre');
  });

  it('should handle leap year dates correctly', () => {
    // Arrange
    const leapYearDate = '2024-02-29';

    // Act
    const result = getFormattedDate(leapYearDate);

    // Assert - Result depends on local timezone (might be 28 or 29)
    expect(result).toMatch(/^(28|29) de febrero de 2024$/);
    expect(result.toLowerCase()).toContain('febrero');
    expect(result).toContain('2024');
  });

  it('should format various months correctly in Spanish', () => {
    // Arrange
    const testCases = [
      { date: '2024-01-15', month: 'enero' },
      { date: '2024-02-15', month: 'febrero' },
      { date: '2024-03-15', month: 'marzo' },
      { date: '2024-04-15', month: 'abril' },
      { date: '2024-05-15', month: 'mayo' },
      { date: '2024-06-15', month: 'junio' },
      { date: '2024-07-15', month: 'julio' },
      { date: '2024-08-15', month: 'agosto' },
      { date: '2024-09-15', month: 'septiembre' },
      { date: '2024-10-15', month: 'octubre' },
      { date: '2024-11-15', month: 'noviembre' },
      { date: '2024-12-15', month: 'diciembre' },
    ];

    // Act & Assert
    testCases.forEach(({ date, month }) => {
      const result = getFormattedDate(date);
      expect(result.toLowerCase()).toContain(month);
      expect(result).toContain('2024');
    });
  });
});
