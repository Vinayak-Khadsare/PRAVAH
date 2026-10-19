import pytest
from backend.services.graph_service import GraphIntelligenceEngine
from backend.database import db_manager

def test_workflow_dag_topology():
    """Verify Directed Acyclic Graph structure has 6 canonical stages and zero cycles."""
    G = GraphIntelligenceEngine.build_workflow_dag()
    import networkx as nx
    assert nx.is_directed_acyclic_graph(G) is True
    assert len(G.nodes) == 6
    assert 1 in G.nodes and 6 in G.nodes

def test_application_dependency_analysis():
    """Blocked application correctly identifies halted downstream stages."""
    blocked_app = {
        "id": "APP-2026-00124",
        "currentStageNumber": 2,
        "criticalBlocker": {
            "title": "Unregistered Land Encumbrance Certificate",
            "ruleRef": "APH-2026-CH2-S2.4"
        },
        "deficiencies": [
            {"isCritical": True, "status": "deficient", "title": "Missing Deed Endorsement", "refCode": "APH-2.4"}
        ]
    }
    analysis = GraphIntelligenceEngine.analyze_application_dependencies(blocked_app)
    assert analysis["isBlocked"] is True
    assert analysis["blockedStage"] == 2
    assert len(analysis["downstreamStagesHalted"]) >= 4
    assert any("EVC Inspection" in stage for stage in analysis["downstreamStagesHalted"])

def test_what_if_simulation_non_mutating():
    """Simulations execute deterministic scenario calculations without mutating live application data."""
    app_state_before = {
        "id": "APP-SIM-TEST",
        "currentStageNumber": 3,
        "daysExpended": 10,
        "statutoryCeiling": 15,
        "status": "re_scrutiny"
    }

    # Simulation 1: Grace Notice
    res1 = GraphIntelligenceEngine.simulate_what_if_scenario(app_state_before, "grace_notice", 48)
    assert res1.predictedSlaBreach is False
    assert res1.calculatedDaysImpact == 2
    assert "Delegated Regional Prerogative" in res1.statutoryRiskIndex

    # Simulation 2: Accept Rectification
    res2 = GraphIntelligenceEngine.simulate_what_if_scenario(app_state_before, "accept_rectification")
    assert res2.predictedSlaBreach is False
    assert res2.calculatedDaysImpact == -3
    assert any("EVC Inspection Panel" in d for d in res2.unblockedDependencies)

    # Simulation 3: Escalate SAC
    res3 = GraphIntelligenceEngine.simulate_what_if_scenario(app_state_before, "escalate_sac")
    assert res3.predictedSlaBreach is True
    assert res3.calculatedDaysImpact == 14
    assert "Appellate Review Required" in res3.statutoryRiskIndex

    # VERIFY ZERO MUTATION of original record
    assert app_state_before["currentStageNumber"] == 3
    assert app_state_before["daysExpended"] == 10
    assert app_state_before["status"] == "re_scrutiny"
