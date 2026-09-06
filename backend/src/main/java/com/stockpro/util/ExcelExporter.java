package com.stockpro.util;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Generic Excel (.xlsx, via Apache POI) file generator.
 * <p>
 * A single implementation serves every export in the app: bold header row on
 * an Excel-green background (#217346), frozen header row, auto-sized columns,
 * and automatic value conversion (booleans, dates, numbers).
 */
public final class ExcelExporter {

    public static final String CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private static final byte[] EXCEL_GREEN = {(byte) 0x21, (byte) 0x73, (byte) 0x46};
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    private ExcelExporter() {
    }

    /**
     * Builds a single-sheet .xlsx workbook named {@code sheetName} with a
     * header row {@code headers} followed by the {@code rows} data rows.
     */
    public static byte[] export(String sheetName, String[] headers, List<Object[]> rows) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet(safeSheetName(sheetName));
            writeHeader(workbook, sheet, headers);
            writeRows(sheet, headers.length, rows);
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Error while generating the Excel file", e);
        }
    }

    /**
     * Wraps the result as an HTTP download response (xlsx Content-Type +
     * Content-Disposition attachment).
     */
    public static ResponseEntity<byte[]> asResponse(String filename, String sheetName, String[] headers, List<Object[]> rows) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(CONTENT_TYPE))
                .body(export(sheetName, headers, rows));
    }

    private static void writeHeader(XSSFWorkbook workbook, Sheet sheet, String[] headers) {
        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setFillForegroundColor(new XSSFColor(EXCEL_GREEN, null));
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);

        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setColor(IndexedColors.WHITE.getIndex());
        headerStyle.setFont(headerFont);

        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        sheet.createFreezePane(0, 1);
    }

    private static void writeRows(Sheet sheet, int columnCount, List<Object[]> rows) {
        int rowIndex = 1;
        for (Object[] row : rows) {
            Row sheetRow = sheet.createRow(rowIndex++);
            for (int i = 0; i < columnCount; i++) {
                Object value = i < row.length ? row[i] : null;
                setCellValue(sheetRow.createCell(i), value);
            }
        }
    }

    private static void setCellValue(Cell cell, Object value) {
        if (value == null) {
            cell.setCellValue("");
        } else if (value instanceof Boolean b) {
            cell.setCellValue(b ? "Yes" : "No");
        } else if (value instanceof LocalDate d) {
            cell.setCellValue(d.format(DATE_FMT));
        } else if (value instanceof LocalDateTime dt) {
            cell.setCellValue(dt.format(DATETIME_FMT));
        } else if (value instanceof Number n) {
            cell.setCellValue(n.doubleValue());
        } else {
            cell.setCellValue(String.valueOf(value));
        }
    }

    private static String safeSheetName(String name) {
        String safe = name.replaceAll("[\\[\\]*?/:\\\\]", " ").trim();
        if (safe.isBlank()) {
            return "Sheet1";
        }
        return safe.length() > 31 ? safe.substring(0, 31) : safe;
    }
}
