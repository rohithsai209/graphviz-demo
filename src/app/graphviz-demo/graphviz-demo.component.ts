import { Component, OnInit, NgZone } from '@angular/core';
import { graphviz } from 'd3-graphviz';
import * as d3 from 'd3';

@Component({
  selector: 'app-graphviz-demo',
  templateUrl: './graphviz-demo.component.html',
  styleUrls: ['./graphviz-demo.component.css'],
})
export class GraphvizDemoComponent implements OnInit {
  // Graph properties
  clickedNode: string = '';
  popupText: string = '';
  popupX: number = 0;
  popupY: number = 0;
  popupVisible: boolean = false;
  private selectedElement: any = null;
  TagName: string = '';
  TagDescription: string = '';
  UoM: string = '';

  // Chat box properties
  chatInput: string = '';
  messages: string[] = [];

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    // Render the Graphviz diagram
    graphviz('#graph', { useWorker: false })
      .renderDot(
        `
        digraph {
          node [shape=box, style=filled, color=lightblue];
          "LT-101" [label=<<u>Level Transmitter</u>>]
          "PRV-101" [label=<<u>Pressure Relief Valve</u>>]
          "T-101" [label=<<u>Inlet Flow Outlet Flow</u>>]
          "PLC-101" [label=<<u>Control Panel</u>>]
          "LT-101" -> "PRV-101" [label="Pressure Level"]
          "PRV-101" -> "T-101" [label="Water Tank"]
          "T-101" -> "PLC-101" [label=""]
        }
      `
      )
      .on('end', () => {
        // Attach click listeners to all nodes once rendering is complete
        d3.selectAll('#graph svg g.node').on('click', (event) => {
          // Remove highlight from previously selected node, if any
          if (this.selectedElement) {
            this.selectedElement.classed('selected', false);
          }
          // Highlight the clicked node
          const current = d3.select(event.currentTarget);
          current.classed('selected', true);
          this.selectedElement = current;

          // Extract the node label from the <title> element
          const nodeTitle = current.select('title').text();
          // Get the bounding rectangle of the clicked node
          const nodeRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
          // Get the container's bounding rectangle
          const container = document.getElementById('graph');
          let relativeX = 0;
          let relativeY = 0;

          if (container) {
            const containerRect = container.getBoundingClientRect();
            // Increase the offsets so the pop-up doesn't overlap the node
            relativeX = nodeRect.right - containerRect.left + 20;
            relativeY = nodeRect.top - containerRect.top + 20;
          }

          // Update component properties
          this.zone.run(() => {
            this.TagName = `Tag Name: "T001"`;
            this.TagDescription = `Tag Description: "Compressor"`;
            this.UoM = `Uom: "mm/hg"`;
            this.popupX = relativeX;
            this.popupY = relativeY;
            this.popupVisible = true;
          });
        });
      });
  }

  // Send a chat message on Enter key
  sendMessage() {
    if (this.chatInput.trim()) {
      this.messages.push(this.chatInput.trim());
      this.chatInput = '';
    }
  }

  // Handle file selection from the file uploader
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      // For demonstration, add the file name as a chat message
      this.messages.push(`File uploaded: ${file.name}`);
      // Optionally, you could implement further logic to read/process the file.
    }
  }
}
