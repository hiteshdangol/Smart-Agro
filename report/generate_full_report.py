# -*- coding: utf-8 -*-
"""Assemble the complete Smart Agro BCA project report (DOCX).

Run from the report/ directory:
    python generate_full_report.py
Output: report/Smart_Agro_Report_v2.docx
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

from report_builder import ReportBuilder
import content_front
import content_ch1
import content_ch2
import content_ch3
import content_ch4
import content_ch5
import content_ch6
import content_ch7
import content_refs
import content_appendices


def build_chapters(b):
    content_ch1.build(b)
    content_ch2.build(b)
    content_ch3.build(b)
    content_ch4.build(b)
    content_ch5.build(b)
    content_ch6.build(b)
    content_ch7.build(b)


def main():
    # Pass 1: dry run to collect the captions for the List of Tables and
    # List of Figures, which physically precede the chapters in the document.
    scratch = ReportBuilder()
    build_chapters(scratch)
    table_captions = list(scratch.tables)
    figure_captions = list(scratch.figures)
    print("Dry run: %d tables, %d figures" % (len(table_captions), len(figure_captions)))

    # Pass 2: real build. Front matter uses the pre-collected caption lists.
    b = ReportBuilder()
    b.tables = table_captions
    b.figures = figure_captions
    content_front.build(b)
    build_chapters(b)
    content_refs.build(b)
    content_appendices.build(b)

    out_path = os.path.join(HERE, "Smart_Agro_Report_v2.docx")
    b.save(out_path)
    print("Saved: %s" % out_path)
    return out_path


if __name__ == "__main__":
    main()
