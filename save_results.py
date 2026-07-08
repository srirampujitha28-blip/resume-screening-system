import openpyxl
import os


def save_result(candidate_name, file_name, percentage, status):

    if not os.path.exists("results.xlsx"):

        wb = openpyxl.Workbook()
        sheet = wb.active

        sheet.title = "Screening Results"

        sheet.append([
            "Candidate Name",
            "Resume File",
            "Match %",
            "Status"
        ])

    else:

        wb = openpyxl.load_workbook("results.xlsx")
        sheet = wb.active

    sheet.append([
        candidate_name,
        file_name,
        percentage,
        status
    ])

    wb.save("results.xlsx")