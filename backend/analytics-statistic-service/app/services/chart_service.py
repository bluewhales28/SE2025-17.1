import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import io
import base64
from typing import Dict, List, Any
import pandas as pd

class ChartService:
    """Service for generating charts and visualizations"""
    
    def generate_bar_chart(self, data: Dict[str, float], title: str = "Bar Chart") -> str:
        """Generate bar chart as base64 encoded image"""
        fig, ax = plt.subplots(figsize=(10, 6))
        
        keys = list(data.keys())
        values = list(data.values())
        
        bars = ax.bar(keys, values, color='#4F81BD', alpha=0.8)
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.set_xlabel('Category', fontsize=12)
        ax.set_ylabel('Value', fontsize=12)
        ax.grid(axis='y', alpha=0.3)
        
        # Add value labels on bars
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{height:.1f}',
                   ha='center', va='bottom', fontsize=10)
        
        plt.tight_layout()
        
        # Convert to base64
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()
        
        return img_base64
    
    def generate_line_chart(self, data: Dict[str, List[float]], title: str = "Line Chart") -> str:
        """Generate line chart for trends"""
        fig, ax = plt.subplots(figsize=(10, 6))
        
        for label, values in data.items():
            ax.plot(range(len(values)), values, marker='o', label=label, linewidth=2)
        
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.set_xlabel('Time Period', fontsize=12)
        ax.set_ylabel('Value', fontsize=12)
        ax.legend()
        ax.grid(alpha=0.3)
        
        plt.tight_layout()
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()
        
        return img_base64
    
    def generate_pie_chart(self, data: Dict[str, float], title: str = "Pie Chart") -> str:
        """Generate pie chart"""
        fig, ax = plt.subplots(figsize=(8, 8))
        
        labels = list(data.keys())
        sizes = list(data.values())
        colors = plt.cm.Set3(range(len(labels)))
        
        ax.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=90, colors=colors)
        ax.set_title(title, fontsize=14, fontweight='bold')
        
        plt.tight_layout()
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()
        
        return img_base64
    
    def generate_histogram(self, values: List[float], title: str = "Histogram", bins: int = 10) -> str:
        """Generate histogram"""
        fig, ax = plt.subplots(figsize=(10, 6))
        
        ax.hist(values, bins=bins, color='#4F81BD', alpha=0.7, edgecolor='black')
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.set_xlabel('Value', fontsize=12)
        ax.set_ylabel('Frequency', fontsize=12)
        ax.grid(axis='y', alpha=0.3)
        
        plt.tight_layout()
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()
        
        return img_base64

