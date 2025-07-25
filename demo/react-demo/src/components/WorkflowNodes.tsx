import React from 'react';
import { v2, type IWorkflowNode, type IStreamPad } from 'gabber-client-react';

function WorkflowNodes() {
  const { nodes, connectionState } = v2.useAppEngine();

  if (connectionState === 'disconnected') {
    return (
      <div className="section">
        <h3>🔗 Workflow Nodes</h3>
        <p>Connect to workflow to see active nodes...</p>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="section">
        <h3>🔗 Workflow Nodes</h3>
        <p>Discovering nodes...</p>
      </div>
    );
  }

  return (
    <div className="section">
      <h3>🔗 Workflow Nodes</h3>
      <div className="workflow-nodes">
        <p style={{ marginBottom: '15px', color: '#666' }}>
          Found {nodes.length} workflow nodes:
        </p>

        {nodes.map(node => (
          <NodeDisplay key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}

interface NodeDisplayProps {
  node: IWorkflowNode;
}

function NodeDisplay({ node }: NodeDisplayProps) {
  const sourcePads = node.getSourcePads();
  const sinkPads = node.getSinkPads();

  return (
    <div className="workflow-node">
      <div className="workflow-node-header">
        <h4 className="workflow-node-title">
          {node.type} <span className="workflow-node-id">({node.id})</span>
        </h4>
        <div className="workflow-node-stats">
          <span className="pad-count">
            📥 {sinkPads.length} input{sinkPads.length !== 1 ? 's' : ''}
          </span>
          <span className="pad-count">
            📤 {sourcePads.length} output{sourcePads.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {sinkPads.length > 0 && (
        <div className="workflow-node-pads">
          <h5>Input Pads (Sink):</h5>
          <div className="pads-list">
            {sinkPads.map(pad => (
              <PadDisplay key={pad.id} pad={pad} />
            ))}
          </div>
        </div>
      )}

      {sourcePads.length > 0 && (
        <div className="workflow-node-pads">
          <h5>Output Pads (Source):</h5>
          <div className="pads-list">
            {sourcePads.map(pad => (
              <PadDisplay key={pad.id} pad={pad} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface PadDisplayProps {
  pad: IStreamPad;
}

function PadDisplay({ pad }: PadDisplayProps) {
  const isConnected = pad.getConnectionState();
  const isPublishing = pad.isPublishing();
  const isSubscribed = pad.isSubscribed();
  const currentStream = pad.getCurrentStream();

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'audio': return '🎵';
      case 'video': return '📹';
      case 'trigger': return '⚡';
      case 'text': return '📝';
      case 'data': return '📊';
      default: return '💾';
    }
  };

  const getPadStatusIcon = () => {
    if (isPublishing) return '📤';
    if (isSubscribed) return '📥';
    if (isConnected) return '🔗';
    return '⚪';
  };

  return (
    <div className="workflow-pad">
      <div className="workflow-pad-header">
        <span className="workflow-pad-icon">
          {getDataTypeIcon(pad.dataType)}
        </span>
        <span className="workflow-pad-name">{pad.name}</span>
        <span className="workflow-pad-type">({pad.dataType})</span>
        <span className="workflow-pad-status">
          {getPadStatusIcon()}
        </span>
      </div>

      <div className="workflow-pad-details">
        <span className="workflow-pad-id">ID: {pad.id}</span>
        {pad.backendType && (
          <span className="workflow-pad-backend-type">
            Type: {pad.backendType}
          </span>
        )}
        {pad.isPropertyPad() && (
          <span className="workflow-pad-property">
            Value: {JSON.stringify(pad.getValue())}
          </span>
        )}
        {currentStream && (
          <span className="workflow-pad-stream">
            Stream: {currentStream.getTracks().length} track(s)
          </span>
        )}
      </div>

      <div className="workflow-pad-status-indicators">
        {isConnected && <span className="status-indicator connected">Connected</span>}
        {isPublishing && <span className="status-indicator publishing">Publishing</span>}
        {isSubscribed && <span className="status-indicator subscribed">Subscribed</span>}
        {pad.isPropertyPad() && <span className="status-indicator property">Property</span>}
      </div>
    </div>
  );
}

export default WorkflowNodes;