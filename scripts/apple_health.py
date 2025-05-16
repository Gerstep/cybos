# RUN:

# python scripts/apple_health_parser.py --list-types
# python scripts/apple_health_parser.py --resting-heart-rate
# python scripts/apple_health_parser.py --plot-resting-heart-rate
# python scripts/apple_health_parser.py --step-count
# python scripts/apple_health_parser.py --step-count-by-day
# python scripts/apple_health_parser.py --plot-step-count-by-day
# python scripts/apple_health_parser.py --plot-step-count-by-week

import xml.etree.ElementTree as ET
import os
import argparse
from datetime import datetime
from collections import defaultdict

# Path to the Apple Health export XML file
xml_path = os.path.join(os.path.dirname(__file__), '../data/myself/health/apple-health-export.xml')

def list_unique_types(root):
    """List all unique @type values from <Record> elements."""
    types_set = set()
    for record in root.findall('.//Record'):
        type_attribute = record.get('type')
        if type_attribute:
            types_set.add(type_attribute)
    print("Unique data types found in Apple Health export:")
    for type_value in sorted(types_set):
        print(type_value)

def show_resting_heart_rate(root):
    """Display all records for HKQuantityTypeIdentifierRestingHeartRate."""
    print("Resting Heart Rate Records:")
    resting_heart_rate_records = root.findall('.//Record[@type="HKQuantityTypeIdentifierRestingHeartRate"]')
    if not resting_heart_rate_records:
        print("No resting heart rate records found.")
    else:
        for record in resting_heart_rate_records:
            start_date = record.get('startDate')
            value = record.get('value')
            unit = record.get('unit')
            print(f"Date: {start_date}, Value: {value} {unit}")

def show_step_count(root):
    """Display all records for HKQuantityTypeIdentifierStepCount."""
    print("Step Count Records:")
    step_count_records = root.findall('.//Record[@type="HKQuantityTypeIdentifierStepCount"]')
    if not step_count_records:
        print("No step count records found.")
    else:
        for record in step_count_records:
            start_date = record.get('startDate')
            value = record.get('value')
            unit = record.get('unit')
            print(f"Date: {start_date}, Value: {value} {unit}")

def show_step_count_by_day(root):
    """Group and sum step count records by day."""
    print("Step Count Grouped by Day:")
    step_count_records = root.findall('.//Record[@type="HKQuantityTypeIdentifierStepCount"]')
    if not step_count_records:
        print("No step count records found.")
        return
    steps_by_day = defaultdict(int)
    for record in step_count_records:
        start_date = record.get('startDate')
        value = record.get('value')
        try:
            day = datetime.strptime(start_date.split(' +')[0], "%Y-%m-%d %H:%M:%S").date()
            steps = int(float(value))
            steps_by_day[day] += steps
        except Exception:
            continue
    for day in sorted(steps_by_day.keys()):
        print(f"Date: {day}, Total Steps: {steps_by_day[day]}")

def plot_step_count_by_day(root):
    """Plot daily step counts as a time series."""
    try:
        import matplotlib.pyplot as plt
    except ImportError:
        print("matplotlib is required for plotting. Install it with 'pip install matplotlib'.")
        return
    step_count_records = root.findall('.//Record[@type="HKQuantityTypeIdentifierStepCount"]')
    if not step_count_records:
        print("No step count records found.")
        return
    steps_by_day = defaultdict(int)
    for record in step_count_records:
        start_date = record.get('startDate')
        value = record.get('value')
        try:
            day = datetime.strptime(start_date.split(' +')[0], "%Y-%m-%d %H:%M:%S").date()
            steps = int(float(value))
            steps_by_day[day] += steps
        except Exception:
            continue
    if not steps_by_day:
        print("No valid step count data to plot.")
        return
    days = sorted(steps_by_day.keys())
    totals = [steps_by_day[day] for day in days]
    plt.figure(figsize=(12, 6))
    plt.plot(days, totals, marker='o', linestyle='-', color='g')
    plt.title('Daily Step Count Over Time')
    plt.xlabel('Date')
    plt.ylabel('Total Steps')
    plt.grid(True)
    plt.tight_layout()
    plt.show()

def plot_step_count_by_week(root):
    """Plot weekly step counts as a time series (ISO week), smoothed with a rolling average and reduced x-axis labels."""
    try:
        import matplotlib.pyplot as plt
        import numpy as np
    except ImportError:
        print("matplotlib and numpy are required for plotting. Install them with 'pip install matplotlib numpy'.")
        return
    step_count_records = root.findall('.//Record[@type="HKQuantityTypeIdentifierStepCount"]')
    if not step_count_records:
        print("No step count records found.")
        return
    steps_by_week = defaultdict(int)
    for record in step_count_records:
        start_date = record.get('startDate')
        value = record.get('value')
        try:
            dt = datetime.strptime(start_date.split(' +')[0], "%Y-%m-%d %H:%M:%S")
            iso_year, iso_week, _ = dt.isocalendar()
            steps = int(float(value))
            steps_by_week[(iso_year, iso_week)] += steps
        except Exception:
            continue
    if not steps_by_week:
        print("No valid weekly step count data to plot.")
        return
    weeks = sorted(steps_by_week.keys())
    week_labels = [f"{y}-W{w:02d}" for y, w in weeks]
    totals = [steps_by_week[week] for week in weeks]

    # Smooth the data with a rolling average (window=4)
    window = 4
    if len(totals) >= window:
        smooth_totals = np.convolve(totals, np.ones(window)/window, mode='valid')
        smooth_labels = week_labels[window-1:]
    else:
        smooth_totals = totals
        smooth_labels = week_labels

    plt.figure(figsize=(12, 6))
    plt.plot(smooth_labels, smooth_totals, marker='o', linestyle='-', color='m', label=f'{window}-week rolling avg')
    plt.title('Weekly Step Count Over Time (Smoothed)')
    plt.xlabel('ISO Week')
    plt.ylabel('Total Steps')

    # Reduce number of x-axis labels to avoid overlap
    label_step = max(1, len(smooth_labels)//16)
    plt.xticks(ticks=np.arange(0, len(smooth_labels), label_step), labels=[smooth_labels[i] for i in range(0, len(smooth_labels), label_step)], rotation=45, ha='right')

    plt.grid(True)
    plt.tight_layout()
    plt.legend()
    plt.show()

def plot_resting_heart_rate(root):
    """Visualize Resting Heart Rate (RHR) as a time series plot."""
    try:
        import matplotlib.pyplot as plt
    except ImportError:
        print("matplotlib is required for plotting. Install it with 'pip install matplotlib'.")
        return

    # Extract RHR records
    records = root.findall('.//Record[@type="HKQuantityTypeIdentifierRestingHeartRate"]')
    if not records:
        print("No resting heart rate records found.")
        return

    # Parse dates and values
    dates = []
    values = []
    for record in records:
        start_date = record.get('startDate')
        value = record.get('value')
        try:
            dt = datetime.strptime(start_date.split(' +')[0], "%Y-%m-%d %H:%M:%S")
            val = float(value)
            dates.append(dt)
            values.append(val)
        except Exception as e:
            continue  # skip malformed records

    if not dates or not values:
        print("No valid resting heart rate data to plot.")
        return

    # Plot
    plt.figure(figsize=(12, 6))
    plt.plot(dates, values, marker='o', linestyle='-', color='b')
    plt.title('Resting Heart Rate Over Time')
    plt.xlabel('Date')
    plt.ylabel('Resting Heart Rate (count/min)')
    plt.grid(True)
    plt.tight_layout()
    plt.show()

def main():
    # Set up CLI argument parsing
    parser = argparse.ArgumentParser(description="Apple Health XML Parser")
    parser.add_argument('--list-types', action='store_true', help='List all unique data types in the export')
    parser.add_argument('--resting-heart-rate', action='store_true', help='Show all resting heart rate records')
    parser.add_argument('--plot-resting-heart-rate', action='store_true', help='Plot resting heart rate as a time series')
    parser.add_argument('--step-count', action='store_true', help='Show all step count records')
    parser.add_argument('--step-count-by-day', action='store_true', help='Show step count records grouped and summed by day')
    parser.add_argument('--plot-step-count-by-day', action='store_true', help='Plot daily step counts as a time series')
    parser.add_argument('--plot-step-count-by-week', action='store_true', help='Plot weekly step counts as a time series')
    args = parser.parse_args()

    # Load and parse the XML file
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()
    except Exception as e:
        print(f"Error parsing XML file: {e}")
        exit(1)

    # Call features based on CLI arguments
    if args.list_types:
        list_unique_types(root)
    if args.resting_heart_rate:
        show_resting_heart_rate(root)
    if args.plot_resting_heart_rate:
        plot_resting_heart_rate(root)
    if args.step_count:
        show_step_count(root)
    if args.step_count_by_day:
        show_step_count_by_day(root)
    if args.plot_step_count_by_day:
        plot_step_count_by_day(root)
    if args.plot_step_count_by_week:
        plot_step_count_by_week(root)
    if not (args.list_types or args.resting_heart_rate or args.plot_resting_heart_rate or args.step_count or args.step_count_by_day or args.plot_step_count_by_day or args.plot_step_count_by_week):
        parser.print_help()

if __name__ == "__main__":
    main()
