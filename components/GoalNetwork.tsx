
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Goal, GoalType } from '../types';

interface GoalNetworkProps {
  goals: Goal[];
  onSelectGoal: (goal: Goal) => void;
}

const GoalNetwork: React.FC<GoalNetworkProps> = ({ goals, onSelectGoal }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || goals.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = 400;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodes = goals.map(g => ({ ...g }));
    const links: any[] = [];

    // Simple automatic connecting: Short-term goals connect to the nearest long-term goal
    const longTerm = nodes.filter(n => n.type === GoalType.LONG_TERM);
    const shortTerm = nodes.filter(n => n.type === GoalType.SHORT_TERM);

    shortTerm.forEach(st => {
      if (longTerm.length > 0) {
        links.push({ source: st.id, target: longTerm[0].id });
      }
    });

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "rgba(255,255,255,0.05)")
      .attr("stroke-width", 1)
      .selectAll("line")
      .data(links)
      .join("line");

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .on("click", (event, d) => onSelectGoal(d as any))
      .style("cursor", "pointer");

    node.append("circle")
      .attr("r", (d: any) => d.type === GoalType.LONG_TERM ? 14 : 8)
      .attr("fill", (d: any) => d.type === GoalType.LONG_TERM ? "rgba(167, 139, 250, 0.4)" : "rgba(110, 231, 183, 0.4)")
      .attr("stroke", "rgba(255,255,255,0.1)")
      .style("filter", "blur(1px)");

    node.append("text")
      .text((d: any) => d.title)
      .attr("x", 15)
      .attr("y", 5)
      .attr("fill", "rgba(255,255,255,0.6)")
      .style("font-size", "10px")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [goals, onSelectGoal]);

  return (
    <div className="w-full glass rounded-3xl overflow-hidden mt-8">
      <div className="p-6 pb-0">
        <h3 className="text-lg text-zinc-400 serif italic">The Unfolding Path</h3>
      </div>
      <svg ref={svgRef} className="w-full h-[400px]" />
    </div>
  );
};

export default GoalNetwork;
