import React from 'react'
import { Grid, Input, Pagination, Segment } from 'semantic-ui-react'

class PaginationExampleControlled extends React.Component {

    constructor() {
        super();
        this.state = {activePage: 10};
        this.handlePaginationChange = (e, { activePage }) => this.setState({ activePage });
    }

    render() {
        const { activePage } = this.state;

        return (
            <Pagination
                activePage={activePage}
                onPageChange={this.handlePaginationChange}
                totalPages={5}
            >
                <Pagination.Item>1</Pagination.Item>
                <Pagination.Item>2</Pagination.Item>
                <Pagination.Item>3</Pagination.Item>
                <Pagination.Item>4</Pagination.Item>
                <Pagination.Item>5</Pagination.Item>
            </Pagination>

        )
    }
}

export default PaginationExampleControlled;